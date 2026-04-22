import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Home } from './pages/Home'
import { Articles } from './pages/Articles';
import { Footer } from './components/Footer';
import { Resources } from './pages/Resources';

export const Layout = () => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav>
        <Link to='/home'>Home</Link>
        <Link to='/articles'>Articles</Link>
        <Link to='/resources'>Resources</Link>
      </nav>
      <main style={{ overflow: 'auto', paddingBottom: '80px' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<Navigate to='/home' />} />
       
            <Route path='/home' element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Home />
              </motion.div>
            }/>
            <Route path='/articles' element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Articles />
              </motion.div>
            }/>
            <Route path='/resources' element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Resources />
              </motion.div>
            }/>
          </Routes>
        </AnimatePresence>
      </main>
      <footer>
        <Footer />
      </footer>
    </motion.div>
  );
}