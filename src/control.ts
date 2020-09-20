// A functor instance should also provide static data constructors
interface Functor<A> {
  fmap: <B>(f: (a: A) => B) => Functor<B>;
};

// An applicative instance should also provide a static pure method
interface Applicative<A> extends Functor<A> {
  ap: <B>(f: Applicative<(a: A) => B>) => Applicative<B>;
};

// A monad instance should also provide a static return method
interface Monad<A> extends Applicative<A> {
  bind: <B>(f: ((a: A) => Monad<B>)) => Monad<B>;
}

export { Functor, Applicative, Monad };

