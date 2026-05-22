import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priceRange: [number, number];
    brands: string[];
    colors: string[];
    sizes: string[];
  };
  onFilterChange: (filters: any) => void;
  availableBrands: string[];
}

export const FilterDrawer = ({ isOpen, onClose, filters, onFilterChange, availableBrands }: FilterDrawerProps) => {
  const priceRanges = [
    { label: 'Under ৳500', range: [0, 500] },
    { label: '৳500 - ৳1000', range: [500, 1000] },
    { label: '৳1000 - ৳5000', range: [1000, 5000] },
    { label: 'Over ৳5000', range: [5000, 100000] },
  ];

  const colors = ['White', 'Black', 'Blue', 'Green', 'Red', 'Yellow'];
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '500g', '1kg', '5kg'];

  const toggleArrayFilter = (key: 'brands' | 'colors' | 'sizes', value: string) => {
    const current = [...filters[key]];
    const index = current.indexOf(value);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    onFilterChange({ ...filters, [key]: current });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-[110] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold font-display">Filters</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Price Range */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onFilterChange({ ...filters, priceRange: r.range })}
                      className={`p-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        filters.priceRange[0] === r.range[0] && filters.priceRange[1] === r.range[1]
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-50 bg-gray-50 text-gray-500'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Brands */}
              {availableBrands.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => toggleArrayFilter('brands', brand)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all flex items-center gap-2 ${
                          filters.brands.includes(brand)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-100 bg-white text-gray-500'
                        }`}
                      >
                        {brand}
                        {filters.brands.includes(brand) && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Colors */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleArrayFilter('colors', color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        filters.colors.includes(color)
                        ? 'border-primary scale-110'
                        : 'border-transparent shadow-sm'
                      }`}
                      style={{ 
                        backgroundColor: color.toLowerCase(),
                        boxShadow: filters.colors.includes(color) ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                      }}
                    >
                      {filters.colors.includes(color) && (
                        <Check size={16} className={color.toLowerCase() === 'white' ? 'text-gray-900' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Sizes */}
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Sizes / Weight</h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleArrayFilter('sizes', size)}
                      className={`h-10 rounded-xl text-xs font-bold border-2 transition-all ${
                        filters.sizes.includes(size)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-100 bg-white text-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => onFilterChange({ priceRange: [0, 100000], brands: [], colors: [], sizes: [] })}
                className="flex-1 button-secondary py-4"
              >
                Reset
              </button>
              <button 
                onClick={onClose}
                className="flex-1 button-primary py-4"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
