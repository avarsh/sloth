/**
 * ======
 * Tardis
 * ======
 */

/*
What we want (Haskell):

example :: Tardis Int Int String
example = do
  x <- getFuture
  sendPast 1
  putFuture 3
  y <- getPast
  return show x ++ show y

runTardis example (0, 0) -- Expect ("13", (1, 3))
*/

/*
Typescript:
*/
