import { lazy, Suspense } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles';
import { Footer } from './components/Footer';
import { ThemeToggle } from './components/ThemeToggle';

// Markdown/KaTeX/highlight.js are heavy, so the article view is loaded on demand.
const Article = lazy(() => import('./pages/Article').then((m) => ({ default: m.Article })));

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 },
};

export const Layout = () => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav>
        <NavLink to='/home'>Home</NavLink>
        <NavLink to='/articles'>Articles</NavLink>
        <ThemeToggle />
      </nav>
      <main className="main">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<Navigate to='/home' />} />

            <Route path='/home' element={
              <motion.div {...pageMotion}>
                <Home />
              </motion.div>
            }/>
            <Route path='/articles' element={
              <motion.div {...pageMotion}>
                <Articles />
              </motion.div>
            }/>
            <Route path='/articles/:slug' element={
              <motion.div {...pageMotion}>
                <Suspense fallback={null}>
                  <Article />
                </Suspense>
              </motion.div>
            }/>
            <Route path='*' element={<Navigate to='/home' />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </motion.div>
  );
}
