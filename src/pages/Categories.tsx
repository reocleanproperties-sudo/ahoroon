import { CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await storeService.getCategories();
        if (c.length > 0) setCategories(c);
      } catch (e) {
        console.error('Error loading categories:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return (
    <div className="px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-sm text-gray-500 font-medium">Explore by style and function</p>
      </div>

      <div className="grid gap-4">
        {categories.map((cat, idx) => (
          <motion.div
            key={`${cat.id || 'cat'}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link 
              to={`/category/${cat.id}`}
              className="glass-card p-6 flex items-center justify-between group overflow-hidden relative"
            >
              <div className="flex items-center gap-6 z-10">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <LayoutGrid size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{cat.name}</h3>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                    24 Products
                  </span>
                </div>
              </div>
              <ChevronRight className="text-gray-200 group-hover:text-primary transition-transform group-hover:translate-x-2" />
              
              {/* Decorative background shape */}
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
