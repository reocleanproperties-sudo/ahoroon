import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Package, 
  Heart, 
  Bell, 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  User, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Mail, 
  Loader, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  Gift,
  Plus,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useLoyalty } from '../context/LoyaltyContext';

interface UserProfile {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { loyalty } = useLoyalty();
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  // Active section inside profile page
  // 'menu' is the main layout, others are the corresponding interactive settings panels
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'payments' | 'notifications' | 'account'>('menu');

  // Real user details from Firestore
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Real user order history from Firestore
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      if (user) {
        // Load details from database
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              name: data.name || user.displayName || '',
              phone: data.phone || '',
              address: data.address || '',
              email: data.email || user.email || '',
            });
          } else {
            // First time initializer
            const defaultProfile = {
              name: user.displayName || '',
              phone: '',
              address: '',
              email: user.email || '',
            };
            setProfile(defaultProfile);
            await setDoc(doc(db, 'users', user.uid), {
              ...defaultProfile,
              points: 0,
              tier: 'Bronze',
              lifetimeSpent: 0,
              role: 'viewer',
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Error fetching user profile info:", err);
        }
      }
    });

    return unsub;
  }, []);

  // Fetch real order history belonging to the current user
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      setOrdersLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        // Sort in memory by date descending to avoid requiring composite indexes
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setOrders(list);
      } catch (err) {
        console.error("Error loading order lists:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (currentUser && activeTab === 'orders') {
      fetchOrders();
    }
  }, [currentUser, activeTab]);

  // Auth logins
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google login failed:", err);
      alert('Login Failure: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfile({ name: '', phone: '', address: '', email: '' });
      setOrders([]);
      setActiveTab('menu');
    } catch (err) {
      console.error(err);
    }
  };

  // Save profile modifications
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileSaving(true);
    setSaveSuccess(false);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        email: profile.email
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Error updating user account details:", err);
      alert('তথ্য সংরক্ষণ করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
    } finally {
      setProfileSaving(false);
    }
  };

  // Human friendly date helper in Bengali
  const formatDateBng = (timestamp: any) => {
    if (!timestamp) return 'সম্পূর্ণ নতুন';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Standard status converter in Bengali
  const getStatusBng = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { label: 'অপেক্ষমাণ', color: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'processing': return { label: 'প্রস্তুত হচ্ছে', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'shipped': return { label: 'পাঠানো হয়েছে', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'delivered': return { label: 'ডেলিভারি সম্পন্ন', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'cancelled': return { label: 'বাতিলকৃত', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { label: 'অপেক্ষমাণ', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface">
        <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
        <span className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-4">লোড করা হচ্ছে...</span>
      </div>
    );
  }

  // GUEST EXPERIENCE / UNSIGNED STATE
  if (!currentUser) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-4xl mx-auto space-y-8 pb-24">
        <div className="bg-white border border-slate-100 rounded-[36px] overflow-hidden p-8 md:p-12 text-center shadow-sm space-y-6 flex flex-col items-center">
          <div className="w-18 h-18 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
            <Gift size={32} strokeWidth={1.5} />
          </div>
          <div className="space-y-2.5 max-w-xl">
            <h1 className="text-2xl md:text-3xl font-black font-sans text-slate-800 leading-tight">
              আমার আহরোণ একাউন্ট
            </h1>
            <p className="text-sm text-slate-500 tracking-wide leading-relaxed font-sans font-medium">
              বাংলার ঐতিহ্যবাহী খাঁটি খাদ্যসম্ভার দ্রুত অর্ডার করতে, আপনার লয়্যালটি ক্লাব পয়েন্ট ও অফার ট্র্যাক করতে এবং অর্ডারের স্ট্যাটাস যেকোনো মুহূর্তে দেখতে আপনার একাউন্টে যুক্ত হোন।
            </p>
          </div>

          <div className="w-full max-w-xs pt-4">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3.5 bg-slate-900 text-white py-4.5 px-6 rounded-2xl shadow-lg hover:bg-slate-800 active:scale-98 transition-all font-bold tracking-wide text-sm cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
              </svg>
              গুগল ব্যবহার করে যুক্ত হোন
            </button>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-2 gap-4 w-full pt-8 border-t border-slate-50 max-w-md">
            <div className="p-4 bg-slate-50/50 rounded-2xl text-center space-y-1">
              <span className="font-bold text-slate-800 text-base md:text-lg">৳১০০ খরচ = ১ পয়েন্ট</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">রিয়েলটাইম রিওয়ার্ডস</p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl text-center space-y-1">
              <span className="font-bold text-slate-800 text-base md:text-lg">সহজ ট্র্যাকিং</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ডেলিভারি স্ট্যাটাস</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-10 max-w-4xl mx-auto space-y-8 pb-32">
      
      {/* 1. APP MENU DASHBOARD VIEW */}
      {activeTab === 'menu' && (
        <div className="space-y-8">
          
          {/* User Profile Header Block */}
          <div className="bg-gradient-to-br from-white to-slate-50/55 border border-slate-100 rounded-[36px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm overflow-hidden shrink-0">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || ''} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={36} strokeWidth={1.5} />
                  )}
                </div>
                {/* Active Indicator badge */}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full flex items-center justify-center">
                  <Star size={8} className="text-white fill-white" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2">
                  {profile.name || currentUser.displayName || 'সম্মানিত উপহারী'}
                </h1>
                <p className="text-xs text-slate-400 font-medium font-mono">{currentUser.email}</p>
                
                {/* Dynamic Membership Club Tier */}
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-600 text-white rounded-full">
                    {loyalty.tier} Club Member
                  </span>
                  {loyalty.points > 0 && (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {loyalty.points} লয়্যালটি পয়েন্ট
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="flex shrink-0">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <LogOut size={14} />
                লগ-আউট
              </button>
            </div>
          </div>

          {/* Quick Realtime Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-100 rounded-3xl p-5.5 text-center shadow-xs flex flex-col justify-center">
              <span className="text-2xl font-black text-emerald-600">{loyalty.points}</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">রিওয়ার্ড পয়েন্টস</p>
            </div>
            
            <div className="bg-white border border-slate-100 rounded-3xl p-5.5 text-center shadow-xs flex flex-col justify-center">
              <span className="text-2xl font-black text-slate-800">
                ৳{(loyalty.lifetimeSpent || 0).toLocaleString('bn-BD')}
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">আজ অব্দি ক্রয়</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-5.5 text-center shadow-xs grid-cols-1 col-span-2 md:col-span-1 flex flex-col justify-center">
              <span className="text-[10px] font-black tracking-widest text-[#005900] uppercase bg-emerald-50 border border-emerald-100/40 rounded-full px-2.5 py-1 w-fit mx-auto leading-none">
                {loyalty.tier} Club
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{loyalty.tier} লেভেল সুবিধা</p>
            </div>
          </div>

          {/* Personal Settings List Interactive Tab Options */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 ml-2">পার্সোনাল সেটিংস (Personal Settings)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* My Orders Selector */}
              <motion.button
                onClick={() => setActiveTab('orders')}
                whileHover={{ y: -3 }}
                className="w-full text-left bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-500/20 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">আমার অর্ডারসমূহ (My Orders)</h4>
                    <p className="text-xs text-slate-400">আপনার ক্রয়কৃত অর্ডার এবং ট্র্যাকিং বিশদ</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </motion.button>

              {/* Wishlist Link - goes directly to /wishlist */}
              <motion.div whileHover={{ y: -3 }}>
                <Link
                  to="/wishlist"
                  className="w-full text-left bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-500/20 shadow-xs block"
                >
                  <div className="flex items-center gap-4.5">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                      <Heart size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">পছন্দের পণ্যতালিকা (Wishlist)</h4>
                      <p className="text-xs text-slate-400">ভবিষ্যতের জন্য সংরক্ষণ করা পণ্যসমূহ</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </Link>
              </motion.div>

              {/* Account / Delivery Settings Selector */}
              <motion.button
                onClick={() => setActiveTab('account')}
                whileHover={{ y: -3 }}
                className="w-full text-left bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-500/20 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                    <Settings size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">ডেলিভারি ও ব্যক্তিগত তথ্য (Account)</h4>
                    <p className="text-xs text-slate-400">নাম, মোবাইল এবং স্থায়ী ডেলিভারি ঠিকানা</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </motion.button>

              {/* Secure Payments Details Selector */}
              <motion.button
                onClick={() => setActiveTab('payments')}
                whileHover={{ y: -3 }}
                className="w-full text-left bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-500/20 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                    <CreditCard size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">পেমেন্ট পদ্ধতিসমূহ (Payments)</h4>
                    <p className="text-xs text-slate-400">সংরক্ষিত মোবাইল ওয়ালেট এবং পেমেন্ট সেটিংস</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </motion.button>

              {/* Notifications and Special Promos Selector */}
              <motion.button
                onClick={() => setActiveTab('notifications')}
                whileHover={{ y: -3 }}
                className="w-full text-left bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group transition-all hover:border-emerald-500/20 shadow-xs md:col-span-2 cursor-pointer"
              >
                <div className="flex items-center gap-4.5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                    <Bell size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">মেসেজ ও বিশেষ কুপন (Notifications & Promos)</h4>
                    <p className="text-xs text-slate-400">বিশেষ ছাড়, ক্যাশব্যাক অফার এবং নোটিফিকেশন তথ্যমালা</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </motion.button>

            </div>
          </div>

        </div>
      )}

      {/* 2. TAB: ORDERS VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              ফিরে যান
            </button>
            <h2 className="text-lg md:text-xl font-bold font-sans text-slate-800">আমার অর্ডারসমূহ (Orders)</h2>
          </div>

          {ordersLoading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Loader className="w-10 h-10 text-emerald-600 animate-spin" />
              <span className="text-xs text-slate-400 font-bold uppercase mt-4">অর্ডার লোড করা হচ্ছে...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center space-y-4 shadow-sm flex flex-col items-center">
              <Package size={48} className="text-slate-200" strokeWidth={1.5} />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-base">আপনার কোনো পূর্ববর্তী অর্ডার নেই</h4>
                <p className="text-xs text-slate-400">আজই অর্ডারে পান আকর্ষণীয় ক্যাশব্যাক ও পয়েন্ট</p>
              </div>
              <Link to="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-md transition-all">
                পণ্য দেখুন (Shop Now)
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const status = getStatusBng(order.status);
                return (
                  <motion.div
                    key={`order-card-${order.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-slate-100 hover:border-emerald-500/15 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300"
                  >
                    <div className="space-y-3.5 text-left flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 font-mono tracking-wider">
                          অর্ডার ID: <span className="text-slate-800 uppercase font-extrabold font-sans">#{order.id.slice(-6)}</span>
                        </span>
                        
                        <span className={`text-[10px] font-black border uppercase px-2.5 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-extrabold text-slate-800 font-sans tracking-wide">
                          পণ্যসমূহ:
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium line-clamp-1">
                          {order.items?.map((item: any) => `${item.name} (${item.quantity}kg)`).join(', ') || 'অজ্ঞাত পণ্যসমূহ'}
                        </p>
                      </div>

                      <div className="text-xs text-slate-400 font-medium">
                        অর্ডারের তারিখ: {formatDateBng(order.createdAt)}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-50 pt-4 md:pt-0 gap-3">
                      <div className="text-right">
                        <span className="text-black font-semibold text-xs text-slate-400 block uppercase tracking-widest font-mono">মোট মূল্য</span>
                        <span className="text-lg font-black text-[#005900] font-sans">৳{(order.total || 0).toLocaleString()}</span>
                      </div>
                      
                      <Link
                        to={`/order-tracking/${order.id}`}
                        className="bg-slate-100 text-slate-700 hover:bg-emerald-500 hover:text-white text-[11px] font-black uppercase tracking-widest py-2.5 px-5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Clock size={12} />
                        লাইভ ট্র্যাক
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TAB: ACCOUNT VIEW */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <button 
              type="button"
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              ফিরে যান
            </button>
            <h2 className="text-lg md:text-xl font-bold font-sans text-slate-800 animate-fade">পার্সোনাল সেটিংস (Account)</h2>
          </div>

          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-700 text-xs font-semibold flex items-center gap-3.5"
              >
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                আপনার ডেলিভারি এবং ব্যক্তিগত তথ্য সফলভাবে সংরক্ষণ করা হয়েছে! পরবর্তী কেনাকাটায় এটি স্বয়ংক্রিয়ভাবে লোড হবে।
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 text-left shadow-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">সম্পূর্ণ নাম (Full Name)</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-slate-300 pointer-events-none" />
                  <input
                    required
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    placeholder="যেমনঃ আদনান চৌধুরী"
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm focus:bg-white focus:border-emerald-500 transition-all shadow-inner font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">মোবাইল নম্বর (Phone Number)</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-4 text-slate-300 pointer-events-none" />
                  <input
                    required
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm focus:bg-white focus:border-emerald-500 transition-all shadow-inner font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ইমেইল ঠিকানা (Email Address)</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-slate-300 pointer-events-none" />
                <input
                  disabled
                  type="email"
                  value={profile.email}
                  className="w-full bg-slate-100/60 border border-slate-100 rounded-2xl p-4 pl-12 text-sm text-slate-400 pointer-events-none font-mono"
                />
              </div>
              <p className="text-[9px] text-slate-400 ml-1 font-sans font-medium">নিরাপত্তা এবং প্রমাণীকরণের কারণে ইমেইল পরিবর্তনযোগ্য নয়।</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">স্থায়ী ডেলিভারি ঠিকানা (Detailed Delivery Address)</label>
              <div className="relative flex items-start">
                <MapPin size={16} className="absolute left-4 top-4.5 text-slate-300 pointer-events-none" />
                <textarea
                  required
                  rows={3}
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  placeholder="যেমনঃ বাসা নং-৪২, রোড নং-০৩, মনসুরাবাদ হাউজিং, মোহাম্মাদপুর, ঢাকা।"
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 pl-12 text-sm focus:bg-white focus:border-emerald-500 transition-all shadow-inner font-sans font-semibold text-slate-800 leading-relaxed"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4.5 px-8 rounded-full shadow-lg enabled:active:scale-98 transition-all flex items-center justify-center gap-2.5 text-xs cursor-pointer"
            >
              {profileSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  তথ্য সংরক্ষণ করুন (Save)
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 4. TAB: PAYMENTS VIEW */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              ফিরে যান
            </button>
            <h2 className="text-lg md:text-xl font-bold font-sans text-slate-800">পেমেন্ট পদ্ধতিসমূহ (Payments)</h2>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 text-left shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">আপনার সংরক্ষিত মোবাইল ওয়ালেট বা কার্ডসমূহ:</h3>
            
            <div className="space-y-4">
              
              {/* Cash on delivery */}
              <div className="border border-emerald-500/10 bg-emerald-500/[0.02] p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h4>
                    <p className="text-xs text-slate-400">ডিফল্টরূপে সক্ষম এবং চার্জ-মুক্ত সুরক্ষিত পেমেন্ট</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full">সক্রিয়</span>
              </div>

              {/* bKash Mobile banking mock up */}
              <div className="border border-slate-100 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-sans font-black text-xs">
                    bkash
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">বিকাশ ওয়ালেট সংযুক্তি (Linked bkash)</h4>
                    <p className="text-xs text-slate-400">পণ্য ক্রয়ে বিকাশ ব্যবহার করে সরাসরি দ্রুত পেমেন্ট সুবিধা</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 hover:text-emerald-650 text-emerald-600 font-black tracking-widest uppercase text-[10px] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                  <Plus size={10} />
                  যুক্ত করুন
                </button>
              </div>

            </div>

            <div className="pt-2 text-xs text-slate-400 text-center leading-relaxed">
              * আমরা সর্বোচ্চ ডেটা এনক্রিপশন প্রোটোকল মেনে চলি। কার্ড ও ইউজার তথ্য সর্বদা সুরক্ষিত থাকে।
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: NOTIFICATIONS VIEW */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <button 
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              ফিরে যান
            </button>
            <h2 className="text-lg md:text-xl font-bold font-sans text-slate-800">বিজ্ঞপ্তি এবং প্রমোকোড (Campaigns)</h2>
          </div>

          <div className="space-y-4 text-left">
            
            {/* Promo coupon notification card */}
            <div className="bg-white border border-slate-100 p-5.5 rounded-3xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 shrink-0 mt-0.5">
                <Gift size={20} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black tracking-widest text-[#005900] uppercase bg-emerald-50 border border-emerald-100/40 rounded px-2 py-0.5">কুপন অফার</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">লয়্যালটি পয়েন্ট অফার! প্রথম কেনাকাটায় ৩ গুন বোনাস</h4>
                <p className="text-xs text-slate-500 leading-relaxed">৩ গুণ বাড়তি পয়েন্ট পেতে এবং ক্লাবের সুবিধাসমূহ উপভোগ করার জন্য আপনার প্রথম কেনাকাটার চেকাউটে <span className="font-mono bg-slate-50 font-extrabold px-1.5 py-0.5 text-slate-900 border border-slate-100 rounded">FIRST3X</span> কুপনটি যুক্ত করতে পারেন।</p>
                <p className="text-[10px] text-slate-400 font-medium">প্রকাশিত: ঠিক ১ দিন পূর্বে</p>
              </div>
            </div>

            {/* Honey stock entry card */}
            <div className="bg-white border border-slate-100 p-5.5 rounded-3xl shadow-xs flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 shrink-0 mt-0.5">
                <Star size={20} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-black tracking-widest text-amber-700 uppercase bg-amber-50 border border-amber-100/40 rounded px-2 py-0.5">নতুন আগমন</span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">সুন্দরবনের টাটকা গরান ফুলের মধু স্টককৃত হয়েছে!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">সুন্দরবনের গভীরে সংগ্রহীত একদম খাঁটি এবং তরল গরান ফুলের ও খলিশা ফুলের প্রাকৃতিক মধু এখন সীমিত স্টক সহ আমাদের এপে যুক্ত করা হয়েছে। কোনো প্রকার কৃত্রিম চর্বি বা ভেজাল ক্ষতিকর উপাদান ছাড়া গ্যারান্টি লাভ করুন।</p>
                <p className="text-[10px] text-slate-400 font-medium">প্রকাশিত: ঠিক ২ দিন পূর্বে</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
