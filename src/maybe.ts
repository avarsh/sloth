import { Monad } from "./control";

class Maybe<A> implements Monad<A> {

  kind: "Just" | "Nothing";
  value?: A;
  
  constructor(value?: A) {
    if (value != null) {
      this.kind = "Just";
      this.value = value;
    } else {
      this.kind = "Nothing";
    }
  }
  
  static just<A>(value: A): Maybe<A> {
    return new Maybe(value);
  }
  
  static nothing<A>(): Maybe<A> {
    return new Maybe();
  }

  fromJust(def: A): A {
    if (this.isJust()) {
      return this.value;
    }
    return def;
  }
  
  isJust(): boolean {
    return this.kind === "Just";
  }
  
  isNothing(): boolean {
    return this.kind === "Nothing";
  }
  
  fmap<B>(f: (a: A) => B): Maybe<B> {
    if (this.isNothing()) {
      return Maybe.nothing();
    } else {
      return Maybe.just(f(this.value));
    }
  }

  ap<B>(f: Maybe<(a: A) => B>): Maybe<B> {
    if (f.isJust() && this.isJust()) {
      return Maybe.just(f.value(this.value));
    } else {
      return Maybe.nothing();
    }
  }
  
  static pure<T>(t: T) {
    return new Maybe(t);
  }
  
  static return<T>(t: T) {
    return Maybe.pure(t);
  }
  
  bind<B>(f: ((a: A) => Maybe<B>)): Maybe<B> {
    if (this.isJust()) {
      return f(this.value);
    } else {
      return Maybe.nothing();
    }
  }
  
  alt<B>(m: Maybe<B>): Maybe<A> | Maybe<B> {
    if (this.isNothing()) {
      return m;
    }
    return this;
  }
  
  static empty<A>(): Maybe<A> {
    return Maybe.nothing();
  }
  
};

export { Maybe };