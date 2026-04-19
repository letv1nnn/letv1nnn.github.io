import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles';
import { Footer } from './pages/Footer';
import { Resources } from './pages/Resources';

export const Layout = () => {
  return (
    <>
      <nav>
        <Link to='/home'>Home</Link>
        <Link to='/articles'>Articles</Link>
        <Link to='/resources'>Resources</Link>
      </nav>
      <main>
        <Routes>
          <Route path='/' element={<Navigate to='/home' />} />
          <Route path='/home' element={<Home />}/>
          <Route path='/articles' element={<Articles />}/>
          <Route path='/resources' element={<Resources />}/>
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}