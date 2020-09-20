import { Monad } from "./control";
import { Maybe } from "./maybe";

export class Lazy<T> {
  
  evaluated: boolean;
  result: T;
  getter: () => T;

  constructor(getter: () => T) {
    this.getter = getter;
    this.evaluated = false;
    this.result = null;
  }
  
  get(): T {
    if (this.evaluated) {
      return this.result;
    }

    this.result = this.getter.apply(this, arguments);
    this.evaluated = true;
    return this.result;
  }
};

export class LazyM<T> extends Lazy<T> implements Monad<T> {
  // Verify the laws...
  fmap<U>(f: (t: T) => U): LazyM<U> {
    return new LazyM(() => {
      return f(this.get());
    });
  }

  ap<U>(f: LazyM<(t: T) => U>): LazyM<U> {
    return new LazyM(() => {
      return f.get()(this.get());
    });
  }
  
  bind<U>(f: (t: T) => LazyM<U>): LazyM<U> {
    return new LazyM(() => {
      return f(this.get()).get();
    });
  }
};
