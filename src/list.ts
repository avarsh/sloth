import { Maybe } from "./maybe";
import { Lazy } from "./lazy";
import { Monad } from "./control";

type ListElem<T> = Maybe<[T, List<T>]>

export class List<T> extends Lazy<ListElem<T>> implements Monad<T> {

  static pure<T>(t: T): List<T> {
    return List.cons(t, List.nil());
  }
  
  fmap<U>(f: (t: T) => U): List<U> {
    const maybe = this.get();
    if (maybe.isNothing()) {
      return List.nil();
    } else {
      const [x, xs] = maybe.value;
      return new List(() => Maybe.just([f(x), xs.fmap(f)]));
    }
  }
  
  ap<U>(f: List<(t: T) => U>): List<U> {
    return new List(() => {
      const fMaybe = f.get();
      const maybe = this.get();
      if (fMaybe.isNothing() || maybe.isNothing()) {
        return Maybe.nothing();
      }
      
      const [g, gs] = fMaybe.value;
      const [x, xs] = maybe.value;
      return Maybe.just([g(x), xs.ap(gs)]);
    });
  }
  
  bind<U>(f: (t: T) => List<U>) {
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
  
  take(n: number): List<T> {
    if (n == 0) { return List.nil(); }
    else {
      let next = this.get();
      if (next.isNothing()) { return List.nil(); }
      else {
        const [t, ts] = next.value;
        return new List(() => Maybe.just([t, ts.take(n - 1)]));
      }
    }
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
