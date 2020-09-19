interface Functor<A> {
  fmap<B>(f: (a: A) => B): Functor<B>;
};

interface Applicative<A> extends Functor<A> {
  ap<B>(f: Applicative<(a: A) => B>): Applicative<B>;
};

interface Monad<A> extends Applicative<A> {
  bind<B>(f: ((a: A) => Monad<B>)): Monad<B>;
}

interface Alternative<T> extends Applicative<T> {
  empty: Alternative<T>;
  alt(a: Alternative<T>): Alternative<T>;
}

export { Functor, Applicative, Monad, Alternative };

