import { Functor, Applicative, Monad } from "./monad";

type _Maybe<A> = {kind: "Just", val: A} | {kind: "Nothing"};

class Maybe<A> implements Functor<A>, Applicative<A>, Monad<A> {
  
  value: _Maybe<A>;
  
  constructor(a: A | null) {
    if (a != null) {
      this.value = { kind: "Just", val: a };
    } else {
      this.value = { kind: "Nothing" };
    }
  }

  fmap<B>(f: (a: A) => B): Maybe<B> {
    if (this.value.kind === "Nothing") {
      return nothing();
    } else {
      return just(f(this.value.val));
    }
  }
  
  pure(a: A) {
    return new Maybe(a);
  }
  
  ap<B>(f: Maybe<(a: A) => B>): Maybe<B> {
    if (f.value.kind === "Just" && this.value.kind === "Just") {
      return just(f.value.val(this.value.val));
    } else {
      return nothing();
    }
  }
  
  bind<B>(f: ((a: A) => Maybe<B>)): Maybe<B> {
    if (this.value.kind === "Just") {
      return f(this.value.val);
    } else {
      return nothing();
    }
  }
};

export function just<T>(val: T): Maybe<T> {
  return new Maybe(val);
}

export function nothing<T>(): Maybe<T> {
  return new Maybe(null);
}

// Example

// Functions
const head = (xs: number[]): Maybe<number> => { 
  if (xs.length > 0) {
    return just(xs[0]);
  } else {
    console.log("failure on head");
    return nothing();
  }
};

const reciprocal = (n: number): Maybe<number> => { 
  if (n == 0) {
    console.log("failure on reciprocal");
    return nothing();
  } else {
    return just(1/n);
  }
};

/*
In haskell:

prog :: [Int] -> Maybe Int
prog xs = do
  x <- head' xs
  y <- reciprocal x
  return y

Desugared:
prog xs = head' xs >>= \x -> reciprocal x >>= return
*/

function prog(ls: number[]): Maybe<number> {
  return just(ls).bind(head).bind(reciprocal);
}

console.log(prog([1, 2, 3]));
console.log(prog([]));
console.log(prog([0, 4, 5]));

export { Maybe };