import { Lazy } from "../src/lazy";

const lAddExample = (x: Lazy<number>, y: Lazy<number>) => new Lazy(() => x.get() + x.get());
const x = new Lazy(() => 1);
const y = new Lazy(() => 45/0);

console.log(lAddExample(x, y).get());
