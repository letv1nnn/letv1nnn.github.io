{-# LANGUAGE ExistentialQuantification #-}

-- run:        runghc src/type_classes.hs
-- dump Core:  ghc -O0 -fforce-recomp -ddump-simpl -dsuppress-all -dsuppress-uniques src/type_classes.hs
--             (swap -O0 for -O to watch the dictionaries disappear)

module Main where

import Data.Char (toLower)

class Shape a where
  area :: a -> Double
  name :: a -> String
  -- a generic method: Rust won't put this behind `dyn`, Haskell doesn't care
  describeWith :: Show b => a -> b -> String
  describeWith x b = name x ++ " tagged " ++ show b

data Circle = Circle Double
data Rectangle = Rectangle Double Double

instance Shape Circle where
  area (Circle r) = pi * r * r
  name _ = "circle"

instance Shape Rectangle where
  area (Rectangle w h) = w * h
  name _ = "rectangle"

-- `Shape a =>` becomes a hidden dictionary argument ($dShape in Core)
describe :: Shape a => a -> String
describe x = name x ++ " with area " ++ show (area x)

-- ask GHC for a dictionary-free copy for Circle ($sdescribe in Core)
{-# SPECIALIZE describe :: Circle -> String #-}

-- with -O this becomes a constant: no dictionary, no call
circleInfo :: String
circleInfo = describe (Circle 1.0)

-- roughly what GHC turns the class into:
--
-- data ShapeDict a = ShapeDict
--   { shapeArea :: a -> Double
--   , shapeName :: a -> String
--   }
--
-- circleDict :: ShapeDict Circle
-- circleDict = ShapeDict { shapeArea = \(Circle r) -> pi * r * r, shapeName = \_ -> "circle" }
--
-- describe :: ShapeDict a -> a -> String
-- describe dict x = shapeName dict x ++ " with area " ++ show (shapeArea dict x)

-- Haskell's Box<dyn Shape>: a value packed together with its dictionary
data AnyShape = forall a. Shape a => AnyShape a

-- the type depends on user input, same as the Rust `parse`
parse :: String -> Either String AnyShape
parse s = case map toLower s of
  "circle"    -> Right (AnyShape (Circle 1))
  "rectangle" -> Right (AnyShape (Rectangle 2 3))
  other       -> Left (other ++ " does not match any variants")

main :: IO ()
main = do
  putStrLn circleInfo
  putStrLn (describe (Rectangle 2 3))

  let parsed = map parse ["circle", "rectangle", "triangle"]
  mapM_ (either putStrLn (\(AnyShape s) -> putStrLn (describe s))) parsed

  let shapes = [s | Right s <- parsed]
  -- the same generic method through the existential, with two different `b`s
  mapM_ (\(AnyShape s) -> putStrLn (describeWith s (42 :: Int))) shapes
  mapM_ (\(AnyShape s) -> putStrLn (describeWith s [True, False])) shapes
