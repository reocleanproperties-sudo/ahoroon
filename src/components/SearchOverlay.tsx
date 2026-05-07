import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { PRODUCTS } from '../data';
import { Link } from 'react-router-dom';

export const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  
  const results = query ? PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
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
                  placeholder="Search products, brands..."
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

            <div className="mt-12 space-y-8">
              {query && results.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Results</h3>
                  <div className="grid gap-2">
                    {results.map(product => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-[1.5rem] hover:bg-primary/5 group transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden">
                            <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">{product.category}</p>
                          </div>
                        </div>
                        <ArrowUpRight size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
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
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Headphones', 'Watches', 'Minimalist', 'Tech', 'Collection 2026'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-5 py-3 bg-gray-50 rounded-full text-sm font-bold text-gray-600 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {tag}
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
