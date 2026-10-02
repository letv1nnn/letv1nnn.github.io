use dispatching::dynamic_dispatch::breaking_dynamic_dispatch;
use dispatching::static_dispatch::foo;

fn main() {
    foo();
    breaking_dynamic_dispatch();
}
