import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, MapPin, Phone, User, ChevronLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { storeService } from '../services/storeService';
import { cn } from '../lib/utils';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await storeService.createOrder({
        items: cart,
        total: totalPrice,
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        paymentMethod: 'COD',
      });
      setCheckoutStep('success');
      clearCart();
    } catch (error) {
      alert('Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutStep === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6"
      >
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-accent-deep">ধন্যবাদ! (Thank You)</h2>
          <p className="text-gray-500 font-medium max-w-sm">আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
        </div>
        <Link to="/" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
          Home এ ফিরে যান
        </Link>
      </motion.div>
    );
  }

  if (cart.length === 0 && checkoutStep === 'cart') {
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
          {checkoutStep === 'cart' ? (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <motion.div
                  key={`${item.id}-${item.selectedSize || 'none'}-${item.selectedColor || 'none'}-${idx}`}
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
                          <p className="text-xs font-medium text-gray-400">Size: {item.selectedSize}</p>
                        )}
                      </div>
                    </div>
                                   <div className="flex items-center justify-between">
                      <span className="font-bold">৳{item.price}</span>
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity - (item.step || 1), { size: item.selectedSize, color: item.selectedColor })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="flex items-center">
                          <input 
                            type="number"
                            step={item.step || 1}
                            min={item.moq || 0}
                            className="text-sm font-bold w-12 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={item.cartQuantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateQuantity(item.id, isNaN(val) ? 0 : val, { size: item.selectedSize, color: item.selectedColor });
                            }}
                          />
                          <span className="text-[10px] font-bold text-gray-400 mr-1">{item.unit || 'pcs'}</span>
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity + (item.step || 1), { size: item.selectedSize, color: item.selectedColor })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white transition-all text-gray-500"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setCheckoutStep('cart')}
                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm"
              >
                <ChevronLeft size={20} /> Back to Cart
              </button>

              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                <div className="glass-card p-6 space-y-6">
                  <h3 className="font-bold text-lg text-accent-deep border-b border-gray-50 pb-4">Shipping Details</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={12} className="text-primary" /> Full Name
                      </label>
                      <input 
                        required
                        type="text"
                        placeholder="আপনার নাম লিখুন"
                        className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={customerInfo.name}
                        onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={12} className="text-primary" /> Phone Number
                      </label>
                      <input 
                        required
                        type="tel"
                        placeholder="আপনার মোবাইল নম্বর"
                        className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={customerInfo.phone}
                        onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={12} className="text-primary" /> Delivery Address
                      </label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="আপনার পূর্ণ ঠিকানা লিখুন"
                        className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                        value={customerInfo.address}
                        onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg text-accent-deep border-b border-gray-50 pb-4 mb-4">Payment Method</h3>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Cash on Delivery</p>
                        <p className="text-[10px] text-gray-400 font-medium">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-4 border-primary bg-white" />
                  </div>
                </div>
              </form>
            </motion.div>
          )}
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
            <span className="text-xl font-bold text-accent-deep font-mono tracking-tighter">৳{totalPrice}</span>
          </div>
        </div>
      </div>

      {checkoutStep === 'cart' ? (
        <button 
          onClick={() => setCheckoutStep('details')}
          className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group transition-all hover:brightness-110 active:scale-95"
        >
          Proceed to Details
          <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </button>
      ) : (
        <button 
          type="submit"
          form="checkout-form"
          disabled={isSubmitting}
          className="w-full bg-accent-deep text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-accent-deep/20 flex items-center justify-center gap-2 group transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Confirm Order (৳{totalPrice})
              <CheckCircle size={20} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
