import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { Product, Category } from '../types';

export const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      async function load() {
        try {
          const [p, c] = await Promise.all([
            storeService.getProducts(),
            storeService.getCategories()
          ]);
          setProducts(p);
          setCategories(c);
        } catch (e) {
          console.error('Search load failed:', e);
        }
      }
      load();
    }
  }, [isOpen]);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || id;
  };

  const results = query ? products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    getCategoryName(p.category).toLowerCase().includes(query.toLowerCase())
  ) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white lg:bg-white/95 lg:backdrop-blur-xl"
        >
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products, categories..."
                  className="w-full bg-gray-50 border-none rounded-3xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={onClose}
                className="p-4 bg-gray-100 rounded-3xl text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-12 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
              {query && results.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Results</h3>
                  <div className="grid gap-2">
                    {results.map((product, idx) => (
                      <Link 
                        key={`${product.id}-${idx}`} 
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] hover:bg-primary/5 group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100">
                            <img 
                              src={product.image} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {(e.target as any).src = 'https://placehold.co/100x100?text=Product'}}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{getCategoryName(product.category)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-sm text-gray-900">৳{product.price}</span>
                          <ArrowUpRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : query ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <Search size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat, idx) => (
                      <button 
                        key={`${cat.id}-${idx}`}
                        onClick={() => setQuery(cat.name)}
                        className="px-5 py-3 bg-gray-50 rounded-full text-sm font-bold text-gray-600 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
