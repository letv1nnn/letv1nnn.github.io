import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles';
import { Footer } from './components/Footer';

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
            <Route path='*' element={<Navigate to='/home' />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </motion.div>
  );
}
