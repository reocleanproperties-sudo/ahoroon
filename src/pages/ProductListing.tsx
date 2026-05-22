import { useParams, Link } from 'react-router-dom';
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeft, SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useMemo } from 'react';
import { storeService } from '../services/storeService';
import { Product, Category } from '../types';
import { FilterDrawer } from '../components/FilterDrawer';

export default function ProductListing() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(
    STATIC_CATEGORIES.find(c => c.id === categoryId) || null
  );
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    priceRange: [0, 100000] as [number, number],
    brands: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
  });

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
      
      const matchesBrand = filters.brands.length === 0 || (p.brand && filters.brands.includes(p.brand));
      
      const matchesColor = filters.colors.length === 0 || 
                          (p.colors && p.colors.some(c => filters.colors.includes(c)));
      
      const matchesSize = filters.sizes.length === 0 || 
                         (p.sizes && p.sizes.some(s => filters.sizes.includes(s)));
      
      return matchesSearch && matchesPrice && matchesBrand && matchesColor && matchesSize;
    });

    if (sortBy === 'price-low') return [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') return [...list].sort((a, b) => b.id.localeCompare(a.id)); 
    
    return list;
  }, [products, searchQuery, filters, sortBy]);

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([
          storeService.getProducts(categoryId),
          storeService.getCategories()
        ]);
        setProducts(p);
        const currentCat = c.find(cat => cat.id === categoryId);
        if (currentCat) setCategory(currentCat);
      } catch (e) {
        console.error('Error loading listing:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId]);

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 min-h-screen pb-24">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:text-primary transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold font-display">{category?.name || 'All Products'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer appearance-none outline-none shadow-xs"
            >
              <option value="relevance">Sort By: relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="p-3 bg-white rounded-2xl shadow-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold tap-feedback"
            >
              <SlidersHorizontal size={16} />
              Filter
              {(filters.brands.length > 0 || filters.colors.length > 0 || filters.sizes.length > 0) && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search within these products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={`listing-prod-${product.id || 'prod'}-${idx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-24 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Search size={32} />
          </div>
          <p className="text-gray-400 font-medium">No products match your filters.</p>
          <button 
            onClick={() => {
              setFilters({ priceRange: [0, 100000], brands: [], colors: [], sizes: [] });
              setSearchQuery('');
            }}
            className="text-primary font-bold text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <FilterDrawer 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        availableBrands={availableBrands}
        onFilterChange={setFilters}
      />
    </div>
  );
}
