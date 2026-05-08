import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { SearchOverlay } from './SearchOverlay';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { adminService } from '../services/adminService';

export const TopNav = () => {
  const { cartCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isUserAdmin = await adminService.isAdmin();
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-50 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="logo-text text-3xl group-hover:text-primary transition-colors">
            আহরোণ
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="p-3 text-primary hover:bg-primary/10 transition-colors rounded-2xl flex items-center gap-2 text-xs font-bold mr-2">
              <Settings size={18} />
              <span className="hidden md:block">Admin</span>
            </Link>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-3 text-gray-600 hover:text-primary transition-colors bg-gray-50 rounded-2xl"
          >
            <Search size={22} />
          </motion.button>
          
          <Link to="/cart" className="relative p-3 text-gray-600 hover:text-primary bg-gray-50 rounded-2xl transition-all">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg shadow-primary/30 ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};


import { Home, LayoutGrid, Heart, User, ShoppingBag as BagIcon, Menu } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/categories', label: 'Explore', icon: LayoutGrid },
    { path: '/wishlist', label: 'Saved', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-3 md:hidden thumb-safe-bottom">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-row items-center gap-2 p-1 px-3 rounded-full transition-all duration-500"
            >
              <div className={cn(
                "p-2 rounded-[1.25rem] transition-all duration-300",
                isActive ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-gray-400"
              )}>
                <Icon size={20} />
              </div>
              <AnimatePresence>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-xs font-bold tracking-tight text-primary overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

