import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { storeService } from '../services/storeService';

export const RecommendedProducts = () => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const allProducts = await storeService.getProducts();
        
        // Return 4 random products since AI is disabled
        setRecommendations(allProducts.sort(() => 0.5 - Math.random()).slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  if (loading) return (
    <div className="space-y-4 px-4 md:px-8">
      <div className="h-6 w-48 bg-gray-100 rounded-full animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-6 px-4 md:px-8 py-8 scroll-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Sparkles className="text-primary" size={20} />
          </div>
          <h2 className="text-xl font-bold font-display text-accent-deep">Recommended for You</h2>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">Top Picks</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {recommendations.map((product, idx) => (
          <motion.div
            key={`recommended-${product.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
