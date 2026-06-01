import { CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Category } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, allProducts] = await Promise.all([
          storeService.getCategories(),
          storeService.getProducts()
        ]);
        
        const targetCategories = c.length > 0 ? c : STATIC_CATEGORIES;
        setCategories(targetCategories);
        
        // Count products dynamically per category
        const counts: Record<string, number> = {};
        targetCategories.forEach(cat => {
          counts[cat.id] = allProducts.filter(p => p.category === cat.id).length;
        });
        setProductCounts(counts);
      } catch (e) {
        console.error('Error loading categories or products:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="bg-white border border-slate-100 p-6 rounded-3xl h-48 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
              <div className="h-5 w-24 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto space-y-8">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-black text-slate-800 font-sans tracking-tight">সব ক্যাটাগরি</h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">খুঁজে নিন আপনার পছন্দের খাঁটি পণ্য</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const count = productCounts[cat.id] ?? 0;
          return (
            <motion.div
              key={`category-card-${cat.id || 'cat'}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.05 }}
            >
              <Link
                to={`/category/${cat.id}`}
                className="group bg-white border border-slate-100 p-6.5 rounded-3xl h-full flex flex-col items-center text-center justify-between min-h-[190px] relative shadow-sm hover:shadow-[0_20px_40px_-5px_rgba(16,185,129,0.14)] hover:border-emerald-500/20 transition-all duration-300 overflow-hidden"
              >
                {/* Visual glow on element hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-500" />

                {/* Icon Container */}
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_8px_16px_rgba(16,185,129,0.2)]">
                  <CategoryIcon name={cat.icon || 'Tag'} size={28} strokeWidth={1.5} />
                </div>

                {/* Details */}
                <div className="mt-4 mb-2 flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-800 text-base md:text-lg group-hover:text-emerald-700 transition-colors line-clamp-1 leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 block">
                    {count} {count === 1 ? 'Product' : 'Products'}
                  </span>
                </div>

                {/* Arrow hint icon - appearing elegantly inside the bottom of the card on hover */}
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
