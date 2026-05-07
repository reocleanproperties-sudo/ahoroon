import { useParams, Link } from 'react-router-dom';
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ProductCard } from '../components/ProductCard';
import { ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';
import { Product, Category } from '../types';

export default function ProductListing() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(
    STATIC_CATEGORIES.find(c => c.id === categoryId) || null
  );
  const [loading, setLoading] = useState(true);

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
    <div className="px-4 md:px-8 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 bg-white rounded-xl shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{category?.name || 'All Products'}</h1>
        </div>
        <button className="p-3 bg-white rounded-2xl shadow-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold">
          <SlidersHorizontal size={16} />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-24 text-center text-gray-400">
          No products found in this category.
        </div>
      )}
    </div>
  );
}
