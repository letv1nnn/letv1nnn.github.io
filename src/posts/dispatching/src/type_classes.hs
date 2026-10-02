
class Shape a where
  area :: a -> Double
  name :: a -> String

data Circle = Circle Double
data Rectangle = Rectangle Double Double

instance Shape Circle where
  area (Circle r) = pi * r * r
  name _ = "circle"

instance Shape Rectangle where
  area (Rectangle w h) = w * h
  name _ = "rectangle"

describe :: Shape a => a -> String
describe x = name x ++ " with area " ++ show (area x)
