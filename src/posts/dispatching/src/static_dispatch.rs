#[allow(unused)]
#[inline(never)]
pub(crate) fn drop<T>(_: T) {}

pub fn foo() {
    let x = std::hint::black_box("".to_string());
    let y = std::hint::black_box(vec![1, 2, 3]);

    drop(x);
    drop(y);
}
