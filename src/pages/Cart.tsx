import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { LoyaltyDashboard } from '../components/LoyaltyDashboard';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
        </div>
        <Link to="/" className="button-primary px-8">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-display uppercase tracking-tight">Cart</h1>
        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{cart.length} items</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {cart.map((item, idx) => (
            <motion.div
              key={`cart-item-${item.id}-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 flex gap-4"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id, { size: item.selectedSize, color: item.selectedColor })}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.size ? (
                      <p className="text-[10px] font-bold text-primary uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full">
                        {item.size} {item.unit || 'pcs'}
                      </p>
                    ) : (
                      item.selectedSize && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Size: {item.selectedSize}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">৳{item.price}</span>
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.cartQuantity - (item.step || 1), { size: item.selectedSize, color: item.selectedColor })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500 shadow-xs"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex items-center px-2">
                      <span className="text-sm font-bold w-6 text-center">{item.cartQuantity}</span>
                      <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{item.unit || 'pcs'}</span>
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.id, item.cartQuantity + (item.step || 1), { size: item.selectedSize, color: item.selectedColor })}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500 shadow-xs"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass-card p-6 space-y-6">
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-500 font-bold uppercase tracking-tight">
            <span>Subtotal</span>
            <span>৳{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-bold uppercase tracking-tight">
            <span>Shipping</span>
            <span className="text-primary">FREE</span>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
            <span className="text-xl font-bold font-display uppercase">Total</span>
            <span className="text-3xl font-black text-primary">৳{totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full button-primary py-5 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 tap-feedback"
        >
          Proceed to Checkout
          <ArrowRight size={20} />
        </button>
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full bg-white text-secondary border-2 border-secondary/20 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-all tap-feedback"
        >
          <Clock size={16} />
          Fast Guest Checkout
        </button>
      </div>

      <div className="pt-8 border-t-2 border-primary/5">
        <LoyaltyDashboard />
      </div>
    </div>
  );
}
