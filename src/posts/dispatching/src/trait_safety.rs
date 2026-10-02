// main rules of object safety for trait objects
// - methods can't have generic params, because vtable cant't store multiple monomorphized functions pointers.
// - methods must have a receiver (associated methods), because there is no particular trait object to dispatch on.
// - methods do not return Self when it is not Sized, because then !Sized obj.clone() makes no sence.

// Self: Sized is often used to make a trait method
// unavailable on trait objects, which helps keep
// the trait object-safe.
pub(crate) fn foo<T: Sized>(_: T) {}
// ?Sized mean may or may not be Sized

pub(crate) trait Create {
    fn new() -> Self
    where
        Self: Sized;
    // fn create<T>(&self, value: T); // breaks object safety
    // fn static_method();            // breaks object safety
}

pub(crate) fn bar(_obj: &dyn Create) {}

// use an associated type if you expect only one implementation of the
// trait for a given type, and use a generic type parameter otherwise.

// blanket trait and impls are object safe
pub(crate) trait Print {
    fn print(&self);
}

impl<T: std::fmt::Display> Print for T {
    fn print(&self) {
        println!("{}", self);
    }
}

// this is allowed, since `Print` is object-safe
pub(crate) fn gar(_obj: &dyn Print) {}

// #[fundamental] is applied for some types, including &, &mut and Box<T> to allow them to break the orphan rule,
// so impl IntoIterator for &MyType is valid, with just the orphan rule, this implementation would
// not be permitted subce it implements a foreign trait for a foreign type (IntoIterator and &).
