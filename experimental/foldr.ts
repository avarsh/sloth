import { Maybe } from "../src/maybe";

class Lazy<T> {

  getter: () => T;
  result: T;

  constructor(getter: () => T) {
    this.getter = getter;
  }

  get() {
    this.result = this.getter();
    this.get = () => this.result;
    return this.result;
  }
}

class List<T> extends Lazy<Maybe<[T, List<T>]>> {

  static cons<T>(t: T, ts: List<T>): List<T> {
    return new List(() => Maybe.just([t, ts]));
  }

  static nil<T>(): List<T> {
    return new List(() => Maybe.nothing());
  }

  static range(start: number, end: number): List<number> {
    return new List(() => {
      if (start > end) return Maybe.nothing();
      return Maybe.just([start, List.range(start + 1, end)]);
    });
  }

  static fromArray<T>(ts: T[]): List<T> {
    return new List(() => {
      if (ts.length == 0) {
        return Maybe.nothing();
      }

      const t = ts.shift();
      return Maybe.just([t, List.fromArray(ts)]);
    });
  }

  toArray(): T[] {
    const elem = this.get();
    if (elem.isNothing()) return [];
    const [t, ts] = elem.value;
    return [t].concat(ts.toArray());
  }

  take(n: number): List<T> {
    return new List(() => {
      if (n == 0) return Maybe.nothing();
      return this.get().fmap(([t, ts]) => [t, ts.take(n - 1)]);
    });
  }

  fmap<U>(f: (t: T) => U): List<U> {
    return new List(() => {
      return this.get().fmap(([t, ts]) => [f(t), ts.fmap(f)]);
    });
  }

  // Applicative

  static pure<T>(t: T): List<T> {
    return List.cons(t, List.nil());
  }

  // ap

  // Monad

  static return<T>(t: T): List<T> {
    return List.pure(t);
  }

  //bind<U>(f: (t: T) => List<U>): List<U> {
  //    return concat(this.fmap(f));
  //}

  // foldr

  _foldr<U>(f: (t: T, u: U) => U, u: U): U {
    if (this.get().isNothing()) return u;
    const [t, ts] = this.get().value;
    return f(t, ts._foldr(f, u));
  }

  /*
  function __id<T>(ts: List<T>): List<T> {
      return new List<T>(() => {
          if (ts.get().isNothing()) return Maybe.nothing();
          const [x, xs] = ts.get().value;
          return Maybe.just([x, __id(xs)]);
      });
  */

  id(): List<T> {
    return new List<T>(() => {
      if (this.get().isNothing()) return Maybe.nothing();
      const [x, xs] = this.get().value;
      return Maybe.just([x, xs.id()]);
    });
  }

  __foldr(u: List<T>): List<T> {
    return new List<T>(() => {
      if (this.get().isNothing()) return u.get();
      const [x, xs] = this.get().value;
      return Maybe.just([x, xs.__foldr(u)]);
    });
  }

  ___foldr(f: (t: T, u: List<T>) => List<T>, u: List<T>): List<T> {
    return new List<T>(() => {
      if (this.get().isNothing()) return u.get();
      const [x, xs] = this.get().value;
      return f(x, xs.___foldr(f, u)).get();
    });
  }

  ____foldr<U>(f: (t: T, u: Lazy<U>) => Lazy<U>, u: Lazy<U>): Lazy<U> {
    return new Lazy<U>(() => {
      if (this.get().isNothing()) return u.get();
      const [x, xs] = this.get().value;
      return f(x, xs.____foldr(f, u)).get();
    });
  }

  // const ls = List.range(1, Infinity)._____foldr((t, ts) => List.cons(t, new List(() => ts.get())), List.range(1, 5));
  _____foldr<U>(f: (t: T, u: U) => U, u: U): U {
    return this.____foldr((x: T, y: Lazy<U>) => new Lazy(() => f(x, y.get())), new Lazy(() => u)).get();
  }

  foldr<U>(f: (t: T, u: Lazy<U>) => Lazy<U>, u: U): Lazy<U> {
    return new Lazy(() => {
      if (this.get().isNothing()) return u;
      const [t, ts] = this.get().value;
      return f(t, ts.foldr(f, u)).get();
    });
  }

  append(ys: List<T>): List<T> {
    return this.foldr((t, ts) => new Lazy(() => List.cons(t, ts.get())), ys).get();
  }
}

function concat<T>(lss: List<List<T>>): List<T> {
  return lss.foldr((ls: List<T>, ms: Lazy<List<T>>) => new Lazy(() => ls.append(ms.get())), List.nil()).get();
}

function id<T>(ts: List<T>) {
  return ts.foldr((t, lazyts) => new Lazy(() => List.cons(t, lazyts.get())), List.nil()).get();
}

function _id<T>(ts: List<T>): List<T> {
  return new List<T>(() => {
    return ts.get();
  });
}

function __id<T>(ts: List<T>): List<T> {
  return new List<T>(() => {
    if (ts.get().isNothing()) return Maybe.nothing();
    const [x, xs] = ts.get().value;
    return Maybe.just([x, __id(xs)]);
  });
}


// console.log(List.range(1, 5).append(List.range(1, Infinity)).take(10).toArray()); // PASS

// console.log(List.range(1, Infinity).append(List.range(1, 5)).take(10).toArray()); // FAILS

// console.log(List.range(1, Infinity).id().take(10).toArray());
// console.log(List.range(1, Infinity).___foldr(List.cons, List.range(1, 5)).take(10).toArray());

// const ls = List.range(1, Infinity).____foldr((t, ts) => List.cons(t, new List(() => ts.get())), List.range(1, 5));
// console.log(new List(() => ls.get()).take(10).toArray());

const ms = List.range(1, Infinity)._____foldr(List.cons, List.range(1, 5));
console.log(ms.take(10).toArray());

// console.log(List.range(1, Infinity).take(10).toArray());