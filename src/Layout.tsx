import { Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles';

export const Layout = () => {
  return (
    <>
      <nav>
        <Link to='/home'>Home</Link>
        <Link to='/articles'>Articles</Link>
      </nav>
      <Routes>
        <Route path='/home' element={<Home />}/>
        <Route path='/articles' element={<Articles />}/>
      </Routes>
    </>
  );
}