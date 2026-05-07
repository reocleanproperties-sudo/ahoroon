import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, Heart, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { PRODUCTS } from '../data';
import { useCart } from '../hooks/useCart';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = PRODUCTS.find(p => p.id === id);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('White');

  if (!product) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="pb-24 lg:pb-10 bg-white">
      {/* Mobile Top Nav */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-white/80 backdrop-blur md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-50 rounded-2xl">
          <ChevronLeft size={24} />
        </button>
        <button className="p-2 bg-gray-50 rounded-2xl">
          <Heart size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start pt-4">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            layoutId={`img-${product.id}`}
            className="aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={product.images[activeImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
          </motion.div>
          <div className="flex gap-4 px-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all",
                  activeImage === idx ? "border-primary scale-105" : "border-transparent opacity-60"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 lg:mt-0 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <span>{product.category}</span>
              <span className="w-1 h-1 rounded-full bg-primary/30" />
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">({product.reviews} reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-gray-900">৳{product.price}</p>
          </div>

          <p className="text-gray-500 leading-relaxed text-sm md:text-base">
            {product.description}
          </p>

          <div className="space-y-6 pt-4 border-t border-gray-100">
            {/* Options */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Size</span>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "w-12 h-12 rounded-2xl font-bold transition-all border flex items-center justify-center",
                      selectedSize === size 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-gray-100 text-gray-600 hover:border-primary/30"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-3xl flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-primary shadow-sm"><Truck size={18} /></div>
                <div className="text-[10px]"><p className="font-bold">Free Shipping</p><p className="text-gray-400">On all orders</p></div>
              </div>
              <div className="p-4 bg-primary/5 rounded-3xl flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-primary shadow-sm"><ShieldCheck size={18} /></div>
                <div className="text-[10px]"><p className="font-bold">Authentic</p><p className="text-gray-400">Certified Quality</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-40 md:relative md:bg-transparent md:border-none md:p-8 lg:p-0 lg:max-w-7xl lg:mx-auto">
        <div className="max-w-7xl mx-auto flex gap-4 md:max-w-none">
          <button className="hidden md:flex p-4 rounded-2xl border border-gray-100 text-gray-400 hover:text-primary transition-colors">
            <Heart size={24} />
          </button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product, 1, { size: selectedSize, color: selectedColor })}
            className="flex-1 bg-primary text-white rounded-[1.5rem] py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
          >
            <ShoppingBag size={20} />
            Add to Cart
          </motion.button>
          <button className="hidden lg:block button-secondary py-4 px-10">
            Quick Buy
          </button>
        </div>
      </div>
    </div>
  );
}
