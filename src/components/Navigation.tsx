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
      <nav id="top-nav-bar" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-2 md:py-3.5 flex items-center justify-between gap-3 md:gap-6 w-full">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img 
            src={siteLogo} 
            alt="আহরোণ" 
            className="h-10 md:h-12.5 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Center: Horizontal Category Quick Buttons Row - Placed inline in the middle */}
        <div id="category-quick-buttons" className="flex-1 min-w-0 flex items-center gap-2.5 overflow-x-auto select-none justify-start md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink touch-pan-x active:cursor-grabbing">
          <Link
            to="/category/all"
            className={cn(
              "flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-100 select-none whitespace-nowrap border shrink-0 transform-gpu active:translate-y-[2.5px] active:border-b-[1.5px]",
              location.pathname === '/category/all'
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-t-emerald-300 border-l-emerald-300 border-r-emerald-600 border-b-[4px] border-b-emerald-700 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md"
                : "bg-emerald-50/40 text-emerald-800 border-t-white border-l-white border-r-emerald-100 border-b-[4px] border-b-emerald-200/90 shadow-[0_2px_6px_rgba(16,185,129,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-emerald-100/50 hover:text-emerald-900 border-emerald-100/60 backdrop-blur-[5px]"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>সব পণ্য</span>
          </Link>

          {categories.map((cat, idx) => {
            const isActive = location.pathname === `/category/${cat.id}`;
            const catStyles: Record<string, { active: string; inactive: string }> = {
              'shukti': {
                active: "bg-gradient-to-br from-amber-400 to-amber-500 text-white border-t-amber-300 border-l-amber-300 border-r-amber-500 border-b-[4px] border-b-amber-700 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md",
                inactive: "bg-amber-50/40 text-amber-800 border-t-white border-l-white border-r-amber-100 border-b-[4px] border-b-amber-200/90 shadow-[0_2px_6px_rgba(245,158,11,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-amber-100/50 hover:text-amber-900 border-amber-100/50 backdrop-blur-[5px]"
              },
              'sea-fish': {
                active: "bg-gradient-to-br from-sky-400 to-blue-500 text-white border-t-sky-300 border-l-sky-300 border-r-blue-500 border-b-[4px] border-b-blue-700 shadow-[0_8px_20px_-4px_rgba(14,165,233,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md",
                inactive: "bg-sky-50/40 text-sky-800 border-t-white border-l-white border-r-sky-100 border-b-[4px] border-b-sky-200/90 shadow-[0_2px_6px_rgba(14,165,233,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-sky-100/50 hover:text-sky-900 border-sky-100/50 backdrop-blur-[5px]"
              },
              'hilly': {
                active: "bg-gradient-to-br from-teal-400 to-emerald-600 text-white border-t-teal-300 border-l-teal-300 border-r-teal-600 border-b-[4px] border-b-teal-800 shadow-[0_8px_20px_-4px_rgba(13,148,136,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md",
                inactive: "bg-teal-50/40 text-teal-800 border-t-white border-l-white border-r-teal-100 border-b-[4px] border-b-teal-200/90 shadow-[0_2px_6px_rgba(13,148,136,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-teal-100/50 hover:text-teal-900 border-teal-100/50 backdrop-blur-[5px]"
              },
              'spices': {
                active: "bg-gradient-to-br from-rose-450 to-red-500 text-white border-t-rose-300 border-l-rose-300 border-r-rose-500 border-b-[4px] border-b-rose-700 shadow-[0_8px_20px_-4px_rgba(244,63,94,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md",
                inactive: "bg-rose-50/40 text-rose-800 border-t-white border-l-white border-r-rose-100 border-b-[4px] border-b-rose-200/90 shadow-[0_2px_6px_rgba(244,63,94,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-rose-100/50 hover:text-rose-900 border-rose-100/50 backdrop-blur-[5px]"
              },
              'tradition': {
                active: "bg-gradient-to-br from-indigo-400 to-purple-500 text-white border-t-indigo-300 border-l-indigo-300 border-r-indigo-500 border-b-[4px] border-b-indigo-700 shadow-[0_8px_20px_-4px_rgba(99,102,241,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] md:hover:brightness-105 backdrop-blur-md",
                inactive: "bg-indigo-50/40 text-indigo-800 border-t-white border-l-white border-r-indigo-100 border-b-[4px] border-b-indigo-200/90 shadow-[0_2px_6px_rgba(99,102,241,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.85)] hover:bg-indigo-100/50 hover:text-indigo-900 border-indigo-100/50 backdrop-blur-[5px]"
              },
            };
            
            const currentStyle = catStyles[cat.id] || {
              active: "bg-primary text-white border-primary border-b-[4px] border-b-emerald-800 shadow-md shadow-primary/20 hover:brightness-105",
              inactive: "bg-slate-50 text-slate-600 border-slate-200 border-b-[4px] border-b-slate-200 hover:bg-slate-100 hover:text-slate-800"
            };

            const appliedStyle = isActive ? currentStyle.active : currentStyle.inactive;

            return (
              <Link
                key={`${cat.id}-${idx}`}
                to={`/category/${cat.id}`}
                className={cn(
                  "flex items-center gap-1.5 px-4.5 py-2 rounded-full text-sm font-semibold transition-all duration-100 select-none whitespace-nowrap border shrink-0 transform-gpu active:translate-y-[2.5px] active:border-b-[1px]",
                  appliedStyle
                )}
              >
                <CategoryIcon name={cat.icon} size={12} strokeWidth={2.5} />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && (
            <Link to="/admin" className="p-2 md:p-3 text-primary hover:bg-primary/10 transition-colors rounded-2xl flex items-center gap-2 text-xs font-bold mr-1">
              <Settings size={18} />
              <span className="hidden md:block">Admin</span>
            </Link>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 md:p-3 text-gray-600 hover:text-primary transition-colors bg-gray-50 rounded-2xl"
          >
            <Search size={20} className="md:w-[22px] md:h-[22px]" />
          </motion.button>
          
          <Link to="/cart" className="relative p-2.5 md:p-3 text-gray-600 hover:text-primary bg-gray-50 rounded-2xl transition-all">
            <ShoppingBag size={20} className="md:w-[22px] md:h-[22px]" />
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

