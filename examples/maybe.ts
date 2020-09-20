import { Maybe } from "../src/maybe";

// Functions
const head = (xs: number[]): Maybe<number> => { 
  if (xs.length > 0) {
    return Maybe.just(xs[0]);
  } else {
    console.log("Failure on head");
    return Maybe.nothing();
  }
};

const reciprocal = (n: number): Maybe<number> => { 
  if (n == 0) {
    console.log("Failure on reciprocal");
    return Maybe.nothing();
  } else {
    return Maybe.just(1/n);
  }
};

function prog(ls: number[]): Maybe<number> {
  return Maybe.just(ls).bind(head).bind(reciprocal);
}

console.log(prog([1, 2, 3]));
console.log(prog([]));
console.log(prog([0, 4, 5]));
