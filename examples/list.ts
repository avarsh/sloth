import { List, zipWith, concat, sum } from "../src/list";
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

// Knight Dialer

const initial: List<number> = List.repeat(1).take(10);

function neighbours(x: number): List<number> {
  switch (x) {
    case 1:
      return List.fromArray([6, 8]);
    case 2:
      return List.fromArray([7, 9]);
    case 3:
      return List.fromArray([4, 8]);
    case 4:
      return List.fromArray([3, 9, 0]);
    case 5:
      return List.fromArray([]);
    case 6:
      return List.fromArray([1, 7, 0]);
    case 7:
      return List.fromArray([2, 6]);
    case 8:
      return List.fromArray([1, 3]);
    case 9:
      return List.fromArray([2, 4]);
    case 0:
      return List.fromArray([4, 6]);
  }
  
  throw new Error(`Number ${x} not supported`);
}

function calc(prev: List<number>): List<number> {
  return List
    .range(0, 9)
    .bind((x) => List
    .pure(
      sum(neighbours(x).fmap((n) => prev.at(n))
  )));
}

const knights: List<List<number>> = new List(() => 
  Maybe.just([ initial, knights.fmap(calc)]))

console.log("Knights!");
console.log(knights.at(2).at(6));