import { Monad } from "./monad";
import { Maybe, just, nothing } from "./maybe";

class Lazy<T> {
  
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

class LazyM<T> extends Lazy<T> implements Monad<T> {
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


// Convenience wrappers
const lAddExample = (x: Lazy<number>, y: Lazy<number>) => new Lazy(() => x.get() + x.get());
const x = new Lazy(() => 1);
const y = new Lazy(() => 45/0);

console.log(lAddExample(x, y).get());

// Lazy lists

type ListElem<T> = Maybe<[T, List<T>]>
class List<T> extends Lazy<ListElem<T>> implements Monad<T> {

  static pure<T>(t: T): List<T> {
    return List.cons(t, List.nil());
  }
  
  fmap<U>(f: (t: T) => U): List<U> {
    const maybe = this.get();
    if (maybe.value.kind === "Nothing") {
      return List.nil();
    } else {
      const [x, xs] = maybe.value.val;
      return new List(() => just([f(x), xs.fmap(f)]));
    }
  }
  
  ap<U>(f: List<(t: T) => U>): List<U> {
    return new List(() => {
      const fMaybe = f.get();
      const maybe = this.get();
      if (fMaybe.value.kind === "Nothing" || maybe.value.kind === "Nothing") {
        return nothing();
      }
      
      const [g, gs] = fMaybe.value.val;
      const [x, xs] = maybe.value.val;
      return just([g(x), xs.ap(gs)]);
    });
  }
  
  bind<U>(f: (t: T) => List<U>) {
    return concat(this.fmap(f));
  }
  
  static cons<T>(t: T, ts: List<T>): List<T> {
    return new List(() => just([t, ts]));
  }
  
  static nil<T>(): List<T> {
    return new List(() => nothing());
  }
 
  static fromArray<U>(ts: U[]): List<U> {
    if (ts.length === 0) {
      return List.nil();
    }
  
    const t = ts.shift();
    return List.cons(t, List.fromArray(ts));
  }
  
  static range(start: number, end: number): List<number> {
    if (start > end) {
      return List.nil();
    } else {
      return new List(() => just([start, List.range(start + 1, end)]));
    }
  }
  
  static guard<T>(cond: boolean): List<T> {
    if (cond) {
      return List.cons(null, List.nil());
    } else {
      return List.nil();
    }
  }
  
  take(n: number): List<T> {
    if (n == 0) { return List.nil(); }
    else {
      let next = this.get();
      if (next.value.kind === "Nothing") { return List.nil(); }
      else {
        const [t, ts] = next.value.val;
        return new List(() => just([t, ts.take(n - 1)]));
      }
    }
  }
  
  toArray(): T[] {
    const maybe = this.get();
    if (maybe.value.kind === "Nothing") {
      return [];
    } else {
      const [t, ts] = maybe.value.val;
      return [t].concat(ts.toArray());
    }
  }
  
  tail(): List<T> {  
    const maybe = this.get();
    if (maybe.value.kind === "Nothing") {
      return List.nil();
    } else {
      const [_, xs] = maybe.value.val;
      return xs;
    }
  }
  
  append(ls: List<T>): List<T> {
    return new List(() => {
      const maybe = this.get();
      if (maybe.value.kind === "Nothing") {
        return ls.get();
      }
      
      const [x, xs] = maybe.value.val;
      return just([x, xs.append(ls)]);
    });
  }
}

function concat<T>(lls: List<List<T>>): List<T> {
  return new List(() => {
    const nextElem = lls.get();
    if (nextElem.value.kind === "Nothing") {
      return nothing();
    } 
    
    const [ls, mms] = nextElem.value.val;
    const ms = concat(mms);
    const lElem = ls.get();
    if (lElem.value.kind === "Nothing") {
      return ms.get();
    } else {
      const [l, ls] = lElem.value.val;
      return just([l, ls.append(ms)]);
    }
  });
}

function zipWith<T>(f: (x: T, y: T) => T, xs: List<T>, ys: List<T>): List<T> {
  return new List(() => {
    const xMaybe = xs.get();
    const yMaybe = ys.get();
    
    if (xMaybe.value.kind === "Just" && yMaybe.value.kind === "Just") {
      const [a, as] = xMaybe.value.val;
      const [b, bs] = yMaybe.value.val;
      return just([f(a, b), zipWith(f, as, bs)])
    } else if (xMaybe.value.kind === "Nothing") {
      return yMaybe;
    }
    
    return xMaybe;
  });
}

console.log(List.range(1, Infinity).tail().take(Infinity).take(5).toArray());

function fib(n: number): number {
  let fibs: List<number> = List.cons(1, List.cons(1, new List(() =>
    just([1, zipWith((x, y) => x + y, fibs, fibs.tail())])
  )));
  return fibs.take(n + 1).toArray()[n];
}

console.log(fib(100));

// console.log(concat(List.cons(List.range(1, 5), List.cons(List.range(2, Infinity), List.nil()))).take(10).toArray());
// console.log(List.range(1, Infinity).fmap(i => i / 5).take(10).toArray());

const pythag: List<[number, number, number]> = List
  .range(1, Infinity)
  .bind(z => List.range(1, z)
  .bind(y => List.range(y, z)
  .bind(x => List
  .guard(x * x + y * y == z * z)
  .bind(_ => List
  .pure([x, y, z])
))));
  
console.log(pythag.take(5).toArray());

/*
Goals:
- Pythagoras
- Fibonacci
*/