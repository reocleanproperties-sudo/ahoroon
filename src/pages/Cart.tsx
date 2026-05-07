import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

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
        <Link to="/" className="button-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <span className="text-sm font-medium text-gray-500">{cart.length} items</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {cart.map((item) => (
            <motion.div
              key={`${item.id}-${item.selectedSize}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 flex gap-4"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-gray-400 mt-1">Size: {item.selectedSize}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold">৳{item.price}</span>
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500"
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
        <h3 className="font-bold text-lg">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>৳{totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Shipping</span>
            <span className="text-green-500 font-bold uppercase tracking-wider text-[10px]">Free</span>
          </div>
          <div className="pt-3 border-t border-gray-100 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold">৳{totalPrice}</span>
          </div>
        </div>
      </div>

      <button className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transition-all hover:brightness-110 active:scale-95">
        Checkout 
        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
