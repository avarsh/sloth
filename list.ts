/*
class List<T> {
  
  counter: number;
  _next: (i: number) => Maybe<T>;
  
  constructor(next: (i: number) => Maybe<T>) {
    this._next = next;
    this.counter = 0;
  }
  
  next(): Maybe<T> {
    this.counter += 1;
    return this._next(this.counter - 1);
  }
};

const numbers = [1, 2, 3, 4, 5, 6];
const xs: List<number> = new List((i) => {
  if (i < numbers.length) {
    return just(numbers[i]);
  } else {
    return nothing();
  }
});

// [0, 2, ...]
const inf: List<number> = new List((i) => {
  return just(i * 2);
});

const empty: List<number> = new List((i) => {
  return nothing();
});

function head<T>(ts: T[]) {
  return ts[0];
}

function repeat<T>(t: T): List<T> {
  return new List((i) => {
    return just(t);
  });
}

function toList<T>(ls: List<T>): T[] {
  const ts: T[]
  while (true) {
    let t = ls.next();
    if (t.value.kind === "Nothing") {
      break;
    } else {
      console.log(t.value.val);
    }
  }
}

printList(repeat(1));
*/