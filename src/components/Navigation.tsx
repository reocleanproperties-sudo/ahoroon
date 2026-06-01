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
import { CATEGORIES as STATIC_CATEGORIES } from '../data';
import { storeService } from '../services/storeService';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const TopNav = () => {
  const { cartCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [siteLogo, setSiteLogo] = useState<string>(
    localStorage.getItem('siteLogo') || ""
  );
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isUserAdmin = await adminService.isAdmin();
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    // Load active firestore/local categories
    storeService.getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(err => console.error("Error loading categories in TopNav:", err));

    // Load site setting for logo
    adminService.getSettings()
      .then(settings => {
        if (settings && settings.logoUrl) {
          setSiteLogo(settings.logoUrl);
        }
      })
      .catch(err => console.error("Error loading settings:", err));

    const handleLogoUpdate = () => {
      const newLogo = localStorage.getItem('siteLogo');
      if (newLogo) setSiteLogo(newLogo);
    };
    window.addEventListener('siteLogoUpdated', handleLogoUpdate);

    return () => {
      unsub();
      window.removeEventListener('siteLogoUpdated', handleLogoUpdate);
    };
  }, []);

  return (
    <>
      <nav id="top-nav-bar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 md:gap-6 w-full">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img 
            src={siteLogo} 
            alt="আহরোণ" 
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link to="/admin" className="p-2 md:p-2.5 text-primary hover:bg-primary/5 transition-colors rounded-xl flex items-center gap-1.5 text-[11px] md:text-xs font-bold mr-1">
              <Settings size={16} />
              <span className="hidden md:block font-sans">Admin</span>
            </Link>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 md:p-2.5 text-gray-600 hover:text-primary transition-colors bg-gray-50 rounded-xl"
          >
            <Search size={18} className="md:w-[20px] md:h-[20px]" />
          </motion.button>
          
          <Link to="/cart" className="relative p-2.5 md:p-2.5 text-gray-600 hover:text-primary bg-gray-50 rounded-xl transition-all">
            <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-lg shadow-primary/30 ring-2 ring-white">
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

