import { Maybe } from "./maybe";
import { Lazy } from "./lazy";
import { Monad } from "./control";

type ListElem<T> = Maybe<[T, List<T>]>

export class List<T> extends Lazy<ListElem<T>> implements Monad<T> {

  static pure<T>(t: T): List<T> {
    return List.cons(t, List.nil());
  }
  
  fmap<U>(f: (t: T) => U): List<U> {
    return new List(() => this.get().fmap(([x, xs]) => [f(x), xs.fmap(f)]));
  }
  
  ap<U>(fs: List<(t: T) => U>): List<U> {
    return fs.bind((f: (t: T) => U) => this.bind((t: T) => List.pure(f(t))));
  }
  
  bind<U>(f: (t: T) => List<U>): List<U> {
    return concat(this.fmap(f));
  }

  static cons<T>(t: T, ts: List<T>): List<T> {
    return new List(() => Maybe.just([t, ts]));
  }
  
  static nil<T>(): List<T> {
    return new List(() => Maybe.nothing());
  }
 
  static fromArray<U>(ts: U[]): List<U> {
    if (ts.length === 0) {
      return List.nil();
    }
  
    const t = ts.shift();
    return List.cons(t, List.fromArray(ts));
  }
  
  static repeat(n: number): List<number> {
    return new List(() => Maybe.just([n, List.repeat(n)]));
  }
  
  static range(start: number, end: number): List<number> {
    if (start > end) {
      return List.nil();
    } else {
      return new List(() => Maybe.just([start, List.range(start + 1, end)]));
    }
  }
  
  static guard<T>(cond: boolean): List<T> {
    if (cond) {
      return List.cons(null, List.nil());
    } else {
      return List.nil();
    }
  }
  
  at(n: number): T {
    return this.take(n + 1).toArray()[n];
  }
  
  take(n: number): List<T> {
    return new List(() => {
      if (n == 0) return Maybe.nothing();
      return this.get().fmap(([t, ts]) => [t, ts.take(n - 1)]);
    });
  }
  
  toArray(): T[] {
    const maybe = this.get();
    if (maybe.isNothing()) {
      return [];
    } else {
      const [t, ts] = maybe.value;
      return [t].concat(ts.toArray());
    }
  }
  
  tail(): List<T> {  
    const maybe = this.get();
    if (maybe.isNothing()) {
      return List.nil();
    } else {
      const [_, xs] = maybe.value;
      return xs;
    }
  }
  
  append(ls: List<T>): List<T> {
    return new List(() => {
      const maybe = this.get();
      if (maybe.isNothing()) {
        return ls.get();
      }
      
      const [x, xs] = maybe.value;
      return Maybe.just([x, xs.append(ls)]);
    });
  }
}

export function concat<T>(lls: List<List<T>>): List<T> {
  return new List(() => {   
    const nextElem = lls.get();
    if (nextElem.isNothing()) {
      return Maybe.nothing();
    } 

    const [ls, mms] = nextElem.value;
    const ms = concat(mms);
    const lElem = ls.get();
    if (lElem.isNothing()) {
      return ms.get();
    } else {
      const [l, ls] = lElem.value;
      return Maybe.just([l, ls.append(ms)]);
    }
  });
}

export function zipWith<T>(f: (x: T, y: T) => T, xs: List<T>, ys: List<T>): List<T> {
  return new List((): ListElem<T> => {
    const xMaybe = xs.get();
    const yMaybe = ys.get();
    
    if (xMaybe.isJust() && yMaybe.isJust()) {
      const [a, as] = xMaybe.value;
      const [b, bs] = yMaybe.value;
      return Maybe.just([f(a, b), zipWith(f, as, bs)])
    } else if (xMaybe.isNothing()) {
      return yMaybe;
    }
    
    return xMaybe;
  });
}

export function sum(ls: List<number>): number {
  const numbers = ls.toArray();
  let total = 0;
  for (let n of numbers) {
    total += n;
  }
  
  return total;
}