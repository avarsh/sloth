# Sloth

Experiments with laziness, lists and functional Haskell-style programming in Typescript.

## Examples

### Fibonacci

A Haskell program to efficiently calculate the Fibonacci numbers is as follows:

```
fibs :: [Integer]
fibs = 1 : 1 : zipWith (+) fibs (tail fibs)
```

This **astounding** one liner takes advantage of the laziness of lists, and now
it is possible to horribly recreate this in Typescript, causing much pain to many
programmers of many lifestyles and paradigms:

```
let fibs: List<number> = List.cons(1, new List(() =>
    just([1, zipWith((x, y) => x + y, fibs, fibs.tail())])
  ));
```

### Monadic List Comprehensions

In Haskell, we may like to do a list comprehension to retrieve all Pythagorean triples:

```
pythag = [(x, y, z) | z <- [1..], y <- [1..z], x <- [y..z], x * x + y * y == z * z]
```

Alternatively, since lists form a monad, we may write this in the following do-style notation:

```
pythag :: [(Int, Int, Int)]
pythag = do
  z <- [1..]
  y <- [1..z]
  x <- [y..z]
  guard $ x * x + y * y == z * z
  pure (x, y, z)
```

Once more, we shall kill several puppies and cause at least one person to punch their monitor:

```
const pythag: List<[number, number, number]> = List
  .range(1, Infinity)
  .bind(z => List.range(1, z)
  .bind(y => List.range(y, z)
  .bind(x => List
  .guard(x * x + y * y == z * z)
  .bind(_ => List
  .pure([x, y, z])
))));
```