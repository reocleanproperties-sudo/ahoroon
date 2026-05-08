import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { TopNav, BottomNav } from './components/Navigation';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import ProductListing from './pages/ProductListing';
import Admin from './pages/Admin';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <div className="min-h-screen border-none bg-surface pb-20 md:pb-0 font-sans selection:bg-primary selection:text-white">
          <TopNav />
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
                <Route path="/category/:categoryId" element={<PageWrapper><ProductListing /></PageWrapper>} />
                <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
                <Route path="/categories" element={<PageWrapper><Categories /></PageWrapper>} />
                <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
                <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
                <Route path="/login" element={<Navigate to="/admin" replace />} />
                <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <BottomNav />
        </div>
      </CartProvider>
    </Router>
  );
}


function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.22, 1, 0.36, 1] // Custom ease for organic feel
      }}
    >
      {children}
    </motion.div>
  );
}


