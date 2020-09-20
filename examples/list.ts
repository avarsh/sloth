import { List, zipWith, concat } from "../src/list";
import { Maybe } from "../src/maybe";

console.log(List
  .range(1, Infinity)
  .tail()
  .take(Infinity)
  .take(5)
  .toArray()
);

function fib(n: number): number {
  let fibs: List<number> = List.cons(1, new List(() =>
    Maybe.just([1, zipWith((x, y) => x + y, fibs, fibs.tail())])
  ));
  return fibs.take(n + 1).toArray()[n];
}

console.log(fib(1000));

// take 10 $ concat $ [1..5]:[2..]:[]
console.log(concat(
  List.cons(
    List.range(1, 5), 
  List.cons(
    List.range(2, Infinity), 
    List.nil()
  )))
  .take(10)
  .toArray());

console.log(List.range(1, Infinity).fmap(i => i / 5).take(10).toArray());

// pythag = do
//    z <- [1..]
//    y <- [1..z]
//    x <- [y..z]
//    guard $ x * x + y * y == z * z
//    return (x, y, z)
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
