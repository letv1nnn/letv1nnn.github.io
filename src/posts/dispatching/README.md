# your trait object is just two pointers

*02/10/2026*

You call a method on a generic. Which function actually runs? Somebody has to decide, either the compiler or the program at runtime. That's dispatch.

Rust and C++ do both. Static dispatch when the type is known at compile time, dynamic dispatch when it's only known at runtime. I know how Rust does it. Then I started learning Haskell and realized I had no idea what GHC does with `Shape a =>`.

So: Rust first, then the pure functional legend.

---

## Rust

### Static Dispatch

Here's the most useless function in Rust:

```rust
#[inline(never)] // keep it alive so we can look at the asm
fn drop<T>(_: T) {}
```

Fun fact: this is exactly how `std::mem::drop` is implemented. Taking ownership and doing nothing is enough.

Now call it with two types:

```rust
pub fn foo() {
    // black_box stops the optimizer from deleting everything
    let x = std::hint::black_box("".to_string());
    let y = std::hint::black_box(vec![1, 2, 3]);
    drop(x);
    drop(y);
}
```

There's no `drop<T>` in the binary. Generics don't survive compilation. The compiler stamps out one copy per type you actually use. This is ***monomorphization***:

```rust
fn drop_string(_: String) {}
fn drop_vec_i32(_: Vec<i32>) {}
```

Two functions can't have the same symbol name, so the compiler packs the types into the name. This is ***mangling***. Here's the real output (`cargo-show-asm`):

```asm
; drop::<Vec<i32>>
_RINvCs7QZUp2szyQY_11dispatching4dropINtNtCs8oYkXk2gzQW_5alloc3vec3VeclEEB2_:
; drop::<String>
_RINvCs7QZUp2szyQY_11dispatching4dropNtNtCs8oYkXk2gzQW_5alloc6string6StringEB2_:
```

Looks like garbage, but it isn't. `_R` = Rust's [v0 mangling](https://rust-lang.github.io/rfcs/2603-rust-symbol-name-mangling-v0.html). `Cs7QZUp2szyQY_` = a hash of the crate. `11dispatching` = an 11-character name. `4drop` = our function. `I...E` wraps the generic arguments, and `l` means `i32`. The type is right there in the name.

Every call is a direct `call` to a known address. Zero overhead, and the compiler can inline everything. The cost: one copy per type, so your binary and build times grow.

But all of this needs the type at compile time. What if you only find out at runtime?

### Dynamic Dispatch

If the type is only known at runtime, the compiler can't put in a direct `call`. It has to look up the function at runtime. The lookup table is the ***vtable***.

A `&dyn Trait` or `Box<dyn Trait>` is a ***fat pointer***, two `usize`s:

```
[ptr_to_data, ptr_to_vtable]   // 16 bytes on 64-bit
```

There's one vtable per (type, trait) pair. It's generated at compile time and lives in read-only memory. Each one holds the drop function, the size, the alignment, then one function pointer per method. That's the whole trick.

#### Dyn compatibility

Not every trait can be put behind `dyn`. This used to be called ***object safety***; it was [renamed](https://github.com/rust-lang/rust/pull/130826) to ***dyn compatibility***, because it has nothing to do with `unsafe`. Here's a trait that breaks it:

```rust
trait Create {
    fn create<T>(&self, _: T);
}

struct A; // A calls create with a String somewhere
impl Create for A { /* ... */ }
struct B; // B calls it with a Vec<u8>
impl Create for B { /* ... */ }
```

Your first thought: just monomorphize `create` and put it in the vtable. Try writing that vtable:

```rust
#[repr(C)]
struct CreateVTable {
    drop: fn(*mut c_void),
    size: usize,
    alignment: usize,
    // one slot... for which T? String? Vec<u8>? every T any crate will ever use?
    // hell nah
    create: fn(*const c_void, ???),
}
```

A vtable has one slot per method. A generic method isn't one function. It's an infinite family of them, and any downstream crate can add a new `T` at any time. Nothing fits in the slot.

So the main rules:
- **No generic methods.** One slot can't hold an infinite family of functions.
- **Every method needs a `self` receiver.** `fn new() -> Self` has no object to dispatch on.
- **No `Self` by value except as the receiver.** What would `dyn Clone::clone()` return? A thing of unknown size. That's why `Clone` isn't dyn compatible.

The escape hatch: add `where Self: Sized` to a method and it's excluded from the vtable, so the rest of the trait still works with `dyn`. Full list in the [Reference](https://doc.rust-lang.org/reference/items/traits.html#dyn-compatibility), more examples in [`trait_safety.rs`](https://github.com/letv1nnn/letv1nnn.github.io/blob/main/src/posts/dispatching/src/trait_safety.rs).

#### Breaking it

Enough theory. Let's break one.

```rust
trait Shape {
    fn name(&self) -> &str;
    fn area(&self) -> f64;
}

struct Circle { /* ... */ }
impl Shape for Circle { /* ... */ }

struct Rectangle { /* ... */ }
impl Shape for Rectangle { /* ... */ }

// the type depends on user input. this is what dyn is for
fn parse(s: &str) -> Result<Box<dyn Shape>, String> {
    match s.to_ascii_lowercase().trim() {
        "circle" => Ok(Box::new(Circle::default())),
        "rectangle" => Ok(Box::new(Rectangle::default())),
        otherwise => Err(format!("{} does not match any variants", otherwise)),
    }
}
```

What does `shape.name()` compile to? One instruction:

```asm
call    qword ptr [rsi + 24]
```

`rsi` is the vtable pointer. Skip 3 slots (drop, size, align) and call whatever is in slot 4. So the vtable looks like this:

```rust
#[repr(C)]
#[derive(Debug, Clone, Copy)]
struct ShapeVTable<'a> {
    drop: Option<unsafe fn(*mut c_void)>, // null if there's nothing to drop
    size: usize,
    alignment: usize,
    name: fn(*const c_void) -> &'a str,
    area: fn(*const c_void) -> f64,
}
```

The `Option` matters. Since [#122662](https://github.com/rust-lang/rust/pull/122662), rustc writes null into `drop` for types like `Circle` that have nothing to drop, and a plain `fn` pointer is never allowed to be null.

The vtable is in read-only memory, so writing to it would crash the program. Copy it instead, patch the copy, and point the box at it:

```rust
pub fn breaking_dynamic_dispatch() {
    const PTR_SIZE: usize = std::mem::size_of::<usize>();

    let mut circle: Box<dyn Shape> = Box::new(Circle { radius: 42.0 });
    assert_eq!(std::mem::size_of::<Box<dyn Shape>>(), PTR_SIZE * 2); // told you: two pointers

    // the box is [ptr_to_data, ptr_to_vtable]; we want the second one
    let addr_of_ptr_to_data = &mut circle as *mut _ as *mut c_void as usize;
    let addr_of_ptr_to_vtable = addr_of_ptr_to_data + PTR_SIZE;
    let ptr_of_ptr_to_vtable = addr_of_ptr_to_vtable as *mut *const ShapeVTable<'_>;

    // copy the vtable and swap `name`
    let mut fake_vtable = unsafe { **ptr_of_ptr_to_vtable };
    fake_vtable.name = rec;

    // point the box at our copy
    let original = unsafe { *ptr_of_ptr_to_vtable };
    unsafe { *ptr_of_ptr_to_vtable = &fake_vtable };

    assert_eq!(circle.name(), "rectangle"); // a circle that says it's a rectangle

    // put the real vtable back. `fake_vtable` dies before `circle`,
    // and dropping `circle` reads size/align from the vtable
    unsafe { *ptr_of_ptr_to_vtable = original };
}

fn rec(_: *const c_void) -> &'static str {
    "rectangle"
}
```

Disclaimer: none of this is guaranteed. The vtable layout and the field order of a fat pointer are compiler internals that can change in any release. If you want to look at a vtable properly, see `std::ptr::metadata` (unstable, [#81513](https://github.com/rust-lang/rust/issues/81513)). It works today, on my machine, and that's all it needs to do.

---

## Haskell

Haskell has type classes instead of traits. Same idea, different machinery. Rust stamps out a copy per type. GHC (the Haskell compiler) compiles **one** copy and passes it a hidden table of functions called a ***dictionary***.

Same shapes as before:

```haskell
class Shape a where
  area :: a -> Double
  name :: a -> String

data Circle = Circle Double
data Rectangle = Rectangle Double Double

instance Shape Circle where
  area (Circle r) = pi * r * r
  name _ = "circle"

instance Shape Rectangle where
  area (Rectangle w h) = w * h
  name _ = "rectangle"

describe :: Shape a => a -> String
describe x = name x ++ " with area " ++ show (area x)
```

The class becomes a record. Each instance becomes one value of that record. `Shape a =>` becomes an extra argument:

```haskell
data ShapeDict a = ShapeDict
  { shapeArea :: a -> Double
  , shapeName :: a -> String
  }

circleDict :: ShapeDict Circle
circleDict = ShapeDict { shapeArea = \(Circle r) -> pi * r * r, shapeName = \_ -> "circle" }

rectangleDict :: ShapeDict Rectangle
rectangleDict = ShapeDict { shapeArea = \(Rectangle w h) -> w * h, shapeName = \_ -> "rectangle" }

describe :: ShapeDict a -> a -> String
describe dict x = shapeName dict x ++ " with area " ++ show (shapeArea dict x)

-- describe (Circle 1)  becomes  describe circleDict (Circle 1)
```

Don't trust me, ask GHC. `ghc -O0 -ddump-simpl -dsuppress-all -dsuppress-uniques` prints Core, GHC's internal language right before code generation:

```haskell
$fShapeCircle    = C:Shape $carea  $cname
$fShapeRectangle = C:Shape $carea1 $cname1

describe
  = \ @a $dShape x ->
      ++ (name $dShape x)
         (++ (unpackCString# " with area "#)
             (show $fShowDouble (area $dShape x)))
```

There it is. `C:Shape` is the record constructor, `$fShapeCircle` is the Circle dictionary, `$dShape` is the hidden argument. Even `show` takes a dictionary (`$fShowDouble`). At `-O0` it's dictionaries all the way down; even multiplying two `Double`s goes through `$fNumDouble`.

It looks like a vtable, but there's one big difference: **the caller picks the dictionary at compile time.** `describe (Circle 1)` always passes `$fShapeCircle`. Only `describe` itself doesn't know which one it got.

### Plot twist: GHC monomorphizes too

Turn on `-O` and call `describe` in the same module:

```haskell
circleInfo = describe (Circle 1.0)
```

Core:

```haskell
circleInfo3 = D# 3.141592653589793##
circleInfo  = unpackAppendCString# "circle with area "# (... circleInfo3 ...)
```

No dictionary. No call to `describe`. GHC inlined everything and computed the area at compile time. When GHC can see the type, it does what rustc does. You can also ask for it explicitly:

```haskell
{-# SPECIALIZE describe :: Circle -> String #-}
```

This generates a separate `$sdescribe` for Circle with no dictionary, in effect a hand-written `describe::<Circle>`. The real difference between the two languages is the default. Rust monomorphizes everything and makes you ask for `dyn`. GHC passes dictionaries everywhere and optimizes them away when it can.

### Haskell's `dyn`

What about `parse`, where the type depends on user input? Pack the value together with its dictionary:

```haskell
{-# LANGUAGE ExistentialQuantification #-}

data AnyShape = forall a. Shape a => AnyShape a

parse :: String -> Either String AnyShape
parse s = case map toLower s of
  "circle"    -> Right (AnyShape (Circle 1))
  "rectangle" -> Right (AnyShape (Rectangle 2 3))
  other       -> Left (other ++ " does not match any variants")
```

Core:

```haskell
Right (AnyShape $fShapeCircle (Circle (D# 1.0##)))
```

`[dictionary, data]`. It's a fat pointer.

### Generic methods? Sure, why not

This is the part that broke Rust. Add a generic method to the class:

```haskell
class Shape a where
  area :: a -> Double
  name :: a -> String
  describeWith :: Show b => a -> b -> String
  describeWith x b = name x ++ " tagged " ++ show b
```

Then call it through `AnyShape` with an `Int` and with a `[Bool]`:

```
circle tagged 42
rectangle tagged 42
circle tagged [True,False]
rectangle tagged [True,False]
```

It just works. In Core, the dictionary slot holds **one** function:

```haskell
$cdescribeWith = \ @b $dShow x b1 -> ...
```

`b` doesn't need its own copy, because how to `show` a `b` arrives as yet another dictionary (`$dShow`). And one piece of machine code can handle every `b` because almost every Haskell value is a pointer to a heap object. You saw it above: even a `Double` is boxed (`D# 1.0##`). Same size, same calling convention, so nothing needs to be monomorphized. Rust can't do this because a `String` and a `u8` have different sizes and are passed differently.

That's the trade: Haskell pays with boxing and indirection, Rust pays with copies and restrictions.

---

## Conclusion

hmm. fuck it. go read the article again from the top, now that you know how both sides work, then [play with the code](https://github.com/letv1nnn/letv1nnn.github.io/tree/main/src/posts/dispatching). break the vtable yourself. dump some Core. that's it.
