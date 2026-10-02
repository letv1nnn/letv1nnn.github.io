# Dispatching in Rust vs Haskell (WIP)

*02/10/2026 · WIP*

Languages like Rust and C++(compiled, imperative langs) use concepts of dynamic and static dispatch. However, while I was learning Haskell, I wondered how its compiler handling generics and stuff like that.

---

## Rust

Firstly, I'd like to explain how it is going in Rust.

### Static Dispatch

Let's look at the example below
```rust
// tell the compiler to no inline, so we could see its asm
#[inline(never)]
fn drop<T>(_: T) {}
```
Static dispatch uses the concept of ***monomorphization***, where such generic function implementation  is being copied during compilation process only with types that are used with that function.

The function above, would became something like this in case it is used for `Vec<i32>` and `String`. It uses the concept called mangling, which is basically writes the name of each function and then an arbitrarily computed cache.

Looks complex, but just look how it changed the name for tag (used `cargo-show-asm` to disassemble):
```asm
; mangled function tag for drop<Vec<i32>>
.section .text,"xr",one_only,dispatching::drop::<alloc::vec::Vec<i32>>,unique,0
        .p2align        4
_RINvCs7QZUp2szyQY_11dispatching4dropINtNtCs8oYkXk2gzQW_5alloc3vec3VeclEEB2_:
; ...
; 
; mangled function tag for drop<String>
.section .text,"xr",one_only,dispatching::drop::<alloc::string::String>,unique,1
        .p2align        4
_RINvCs7QZUp2szyQY_11dispatching4dropNtNtCs8oYkXk2gzQW_5alloc6string6StringEB2_:
; ...
```

So static dispatch is the simpliest approach since we know types at compile time, but what if we don't (`?Sized`). This is where dynamic dispatch comes in. How would we overcome this?

### Dynamic Dispatch

The answer is ***Virtual Tables*** or Vtables.

When we are passing something that should implement some trait Foo and don't know the size at compile time, we usually do it using fat pointers (`Box<T>` or `&T`) with `dyn` keyword inside, that stores two usizes (pointer + metadata). In this case it would be [`ptr_to_data`, `ptr_to_vtable`] (16 bytes on 64bit arch).

At this stage I should mention the concept called ***Trait Safety***.
There are some cases that wouldn't make sense for the compiler, for example:
```rust
trait Create {
    fn create<T>(&self, _: T);
}

struct A;
// assume object of type A used it later with String
impl Create for A {...}
struct B;
// assume object of type B used it later with Vec<u8>
impl Create for B {...}
```

First thing that you'd probably have in mind is static dispatch working along side dynamic. However, think how would the vtable look like. Different, implementers would need to have different monomorphized functions.

```rust
#[repr(C)]
struct CreateVTable {
    drop: fn(*const c_void);
    size: usize,
    alignment: usize,
    // ohh, wtf, is it gonna store mangled fn ptrs???
    // hell nah, that's not possible
    AKJSFcreateASKJHDV: fn(*const c_void, ???),
}
```

Thus, we can derive three main rules of object safety for trait objects:
- methods can't have generic params, because vtable cant't store multiple monomorphized functions pointers.
- methods must have a receiver (associated methods), because there is no particular trait object to dispatch on.
- methods do not return Self when it is not Sized, because then !Sized obj.clone() makes no sence.

Taking that into account, breaking these rules would restrict you from using trait objects.

TODO: add link to file with more examples

Well, let's conclude dynamic dispatch by taking a look at the following example to actually see what's going on.

```rust
trait Shape {
    fn name(&self) -> &str;
    fn area(&self) -> f64;
}

struct Circle {...}
impl Shape for Circle {...}

struct Rectangle {...}
impl Shape for Rectangle {...}
```

and the following function

```rust
fn parse(s: &str) -> Result<Box<dyn Shape>, String> {
    match s.to_ascii_lowercase().trim() {
        "circle" => Ok(Box::new(Circle::default())),
        "rectangle" => Ok(Box::new(Rectangle::default())),
        otherwise => Err(format!("{} does not match any variants", otherwise)),
    }
}
```

The goal would be to break dynamic dispatch by changing object's vtable.

Here is the vtable that compiler would generate (no accurate, ).
```rust
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub(crate) struct ShapeVTable<'a> {
    drop: fn(*mut c_void),
    size: usize,
    alignment: usize,
    name: fn(*const c_void) -> &'a str,
    area: fn(*const c_void) -> f64,
}
```

And here we are, breaking it

```rust
pub fn breaking_dynamic_dispatch() {
    const PTR_SIZE: usize = std::mem::size_of::<usize>();

    let mut circle: Box<dyn Shape> = Box::new(Circle { radius: 42.0_f64 });
    assert_eq!(std::mem::size_of::<Box<dyn Shape>>(), PTR_SIZE * 2);

    // addr of ptr_to_data and ptr_to_vtable
    // ADDR of [addr_of_data] -> data (object)
    let addr_of_ptr_to_data = &mut circle as *mut _ as *mut c_void as usize;
    // ADDR of [addr_of_vtable] -> vtable (general vtable)
    let addr_of_ptr_to_vtable = addr_of_ptr_to_data + PTR_SIZE;

    let ptr_of_ptr_to_vtable = addr_of_ptr_to_vtable as *mut *const ShapeVTable<'_>;

    // we have copied the underlying vtable of `circle` instance defined above.
    let mut vtable_only_for_circle_instance = unsafe { **ptr_of_ptr_to_vtable };
    // we changed the `name` function to rec, in the COPIED virtual table
    vtable_only_for_circle_instance.name = rec;

    // assign copied vtable to circle instance
    unsafe { *ptr_of_ptr_to_vtable = &vtable_only_for_circle_instance };

    assert_eq!(circle.name(), "rectangle");
}

const fn rec(_: *const c_void) -> &'static str {
    "rectangle"
}
```

---

## Haskell

Well, now Haskell.

Haskell's type classes play the role of Rust's traits, but the default mechanism is different: where Rust copies the function per type, Haskell compiles one copy and passes it a hidden table of functions.

Let's have a look at the following example:

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

So the compiler roughly turns it into a record of functions, called a dictionary. Each instance becomes one value of that record. The constraint `Shape a =>` becomes an extra argument:

```haskell
data ShapeDict a = ShapeDict
  { area :: a -> Double
  , name :: a -> String
  }

shapeDictCircle :: ShapeDict Circle
shapeDictCircle = ShapeDict { area = \(Circle r) -> pi * r * r, name = \_ -> "circle" }

describe :: ShapeDict a -> a -> String
describe dict x = name dict x ++ " with area " ++ show (area dict x)
```
