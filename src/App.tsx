import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import MovieDetailsPage from './components/MovieDetailsPage';
import TVDetailsPage from './components/TVDetailsPage';
import PersonDetailsPage from './components/PersonDetailsPage';
import SearchPage from './components/SearchPage';
import ProfilePage from './components/ProfilePage';
import ForYouPage from './components/ForYouPage';
import MyListPage from './components/MyListPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AuthGuard from './components/AuthGuard';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

        {/* Main Layout with Public and Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="movie/:id" element={<PageTransition><MovieDetailsPage /></PageTransition>} />
          <Route path="tv/:id" element={<PageTransition><TVDetailsPage /></PageTransition>} />
          <Route path="person/:id" element={<PageTransition><PersonDetailsPage /></PageTransition>} />
          <Route path="search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="foryou" element={<PageTransition><ForYouPage /></PageTransition>} />
          
          {/* Protected Routes */}
          <Route
            path="profile"
            element={
              <AuthGuard>
                <PageTransition><ProfilePage /></PageTransition>
              </AuthGuard>
            }
          />
          <Route
            path="mylist"
            element={
              <AuthGuard>
                <PageTransition><MyListPage /></PageTransition>
              </AuthGuard>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.6, 
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
