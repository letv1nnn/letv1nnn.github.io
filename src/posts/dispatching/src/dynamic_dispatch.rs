use std::os::raw::c_void;

pub trait Shape {
    fn name<'a>(&'a self) -> &'a str;
    fn area(&'_ self) -> f64;
}

#[derive(Debug, Clone, Copy, Default)]
pub(crate) struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn name<'a>(&'a self) -> &'a str {
        "circle"
    }
    fn area(&self) -> f64 {
        const PI: f64 = 3.14159265;
        PI * self.radius * self.radius
    }
}

#[derive(Debug, Clone, Copy, Default)]
pub(crate) struct Rectangle {
    width: f64,
    height: f64,
}

impl Shape for Rectangle {
    fn name<'a>(&'a self) -> &'a str {
        "rectangle"
    }
    fn area(&self) -> f64 {
        self.height * self.width
    }
}

// what `shape.name()` compiles to: `call qword ptr [rsi + 24]` (with --release)
#[inline(never)]
pub fn call_name(shape: &dyn Shape) -> usize {
    shape.name().len()
}

// we do not know the resulting Shape, thus we need to return a pointer to it using dyn dispatch
pub(crate) fn parse(s: &'_ str) -> Result<Box<dyn Shape>, String> {
    match s.to_ascii_lowercase().trim() {
        "circle" => Ok(Box::new(Circle::default())),
        "rectangle" => Ok(Box::new(Rectangle::default())),
        otherwise => Err(format!("{} does not match any variants", otherwise)),
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub(crate) struct ShapeVTable<'a> {
    drop: Option<unsafe fn(*mut c_void)>, // null if there's nothing to drop
    size: usize,
    alignment: usize,
    name: fn(*const c_void) -> &'a str,
    area: fn(*const c_void) -> f64,
}

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

    // copy the vtable (it lives in read-only memory) and swap `name`
    let mut fake_vtable = unsafe { **ptr_of_ptr_to_vtable };
    fake_vtable.name = rec;

    // point the box at our copy
    let original = unsafe { *ptr_of_ptr_to_vtable };
    unsafe { *ptr_of_ptr_to_vtable = &fake_vtable };

    assert_eq!(circle.name(), "rectangle");

    // put the real vtable back. `fake_vtable` dies before `circle`,
    // and dropping `circle` reads size/align from the vtable
    unsafe { *ptr_of_ptr_to_vtable = original };
}

fn rec(_: *const c_void) -> &'static str {
    "rectangle"
}
