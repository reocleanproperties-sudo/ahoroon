import { motion } from 'motion/react';
import { Star, ShoppingBag, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 mb-3">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          {product.isFlashSale && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-primary shadow-sm uppercase tracking-wider">
              -{product.discount}%
            </div>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute bottom-3 right-3 bg-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 active:scale-90"
          >
            <Plus size={20} className="text-primary" />
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-gray-900 group-hover:text-primary transition-colors truncate">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-gray-500">{product.rating}</span>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ৳{product.price}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
