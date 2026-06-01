import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronLeft, Truck, CreditCard, ShieldCheck, User } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useLoyalty } from '../context/LoyaltyContext';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

export default function Checkout() {
  const { cart, totalPrice: total, clearCart } = useCart();
  const { loyalty, addPoints } = useLoyalty();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData({
              name: data.name || currentUser.displayName || '',
              phone: data.phone || '',
              address: data.address || '',
              email: data.email || currentUser.email || '',
            });
          } else {
            setFormData(prev => ({
              ...prev,
              name: currentUser.displayName || '',
              email: currentUser.email || '',
            }));
          }
        } catch (err) {
          console.error("Error loading user profile in checkout:", err);
        }
      }
    };
    fetchUserData();
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-4">
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <Link to="/" className="button-primary">Start Shopping</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart,
        total,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          email: formData.email,
        },
        userId: auth.currentUser?.uid || 'guest',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Add to public activity for Social Proof
      await addDoc(collection(db, 'public_activity'), {
        userName: formData.name.split(' ')[0], // Only first name for privacy
        productName: cart[0].name,
        type: 'purchase',
        createdAt: serverTimestamp()
      });
      
      // Add loyalty points (1 point for every ৳100)
      if (auth.currentUser) {
        await addPoints(Math.floor(total / 100));
      }

      clearCart();
      navigate(`/order-tracking/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="p-2 bg-white rounded-xl shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold font-display">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Customer Info</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Abir Khan"
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:border-primary transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:border-primary transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email (Optional)</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:border-primary transition-all shadow-sm"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Delivery Address</h3>
              </div>
              <textarea 
                required
                rows={3}
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Full address where you want to receive the order"
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:border-primary transition-all shadow-sm resize-none"
              />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Payment Method</h3>
              </div>
              <div className="p-4 bg-primary/5 border-2 border-primary rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Truck className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Cash on Delivery</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Pay when you receive</p>
                  </div>
                </div>
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              </div>
            </section>
          </form>

          {/* Order Summary */}
          <div className="space-y-8">
            <div className="glass-card p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Order Summary</h3>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest cursor-default">Qty: {item.cartQuantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">৳{item.price * item.cartQuantity}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm text-gray-500 font-medium uppercase tracking-tight">
                  <p>Subtotal</p>
                  <p>৳{total}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-medium uppercase tracking-tight">
                  <p>Delivery Fee</p>
                  <p className="text-primary">FREE</p>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <p className="text-lg font-bold text-gray-900 uppercase">Total Amount</p>
                  <p className="text-3xl font-black text-primary">৳{total}</p>
                </div>
              </div>

              {auth.currentUser ? (
                <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="text-primary w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Loyalty Points</h4>
                    <p className="text-[10px] text-gray-500">You will earn <span className="text-primary font-bold">{Math.floor(total / 100)} points</span></p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-2xl text-center">
                  <p className="text-xs font-bold text-gray-500">Login to earn reward points!</p>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full button-primary py-5 text-base flex items-center justify-center gap-3 relative overflow-hidden group shadow-xl"
              >
                {loading ? 'Processing...' : (
                  <>
                    Confirm Order
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ChevronLeft className="rotate-180" size={20} />
                    </motion.div>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4 justify-center text-gray-400">
               <div className="flex items-center gap-1">
                 <ShieldCheck size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Safe Payment</span>
               </div>
               <div className="w-1 h-1 bg-gray-200 rounded-full" />
               <div className="flex items-center gap-1">
                 <Truck size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Fast Delivery</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
