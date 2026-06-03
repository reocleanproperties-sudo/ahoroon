import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Plus, 
  Search, 
  MoreVertical, 
  Settings as SettingsIcon,
  LogOut, 
  Save, 
  X,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Newspaper,
  LayoutGrid,
  Eye,
  FileText,
  Printer,
  Download,
  Users,
  Settings,
  ReceiptText,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { adminService } from '../services/adminService';
import { aiService } from '../services/aiService';
import { Product, Category, AppUser, ManualInvoice } from '../types';
import { cn } from '../lib/utils';
import { CategoryIcon } from '../components/CategoryIcon';
import { compressImage } from '../lib/imageUtils';
import { AdminSliders } from '../components/AdminSliders';
import { AdminProducers } from '../components/AdminProducers';
import { AdminPress } from '../components/AdminPress';
import AdminSettings from '../components/AdminSettings';

type Tab = 'dashboard' | 'sliders' | 'products' | 'orders' | 'categories' | 'users' | 'invoices' | 'producers' | 'press' | 'settings';

export default function Admin() {
  const [user, setUser] = useState<any>(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>(
    localStorage.getItem('siteLogo') || ""
  );
  const [manualInvoices, setManualInvoices] = useState<ManualInvoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isManualInvoiceModalOpen, setIsManualInvoiceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<AppUser> | null>(null);
  const [editingManualInvoice, setEditingManualInvoice] = useState<Partial<ManualInvoice> | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isManualInvoicePrintOpen, setIsManualInvoicePrintOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'product' | 'category' | 'user' | 'invoice';
    title: string;
    message?: string;
  } | null>(null);

  // States for Username / Password login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check if custom user is cached
    const customUserStr = localStorage.getItem('customAdminUser');
    if (customUserStr) {
      try {
        const customUser = JSON.parse(customUserStr);
        setUser(customUser);
        setIsAdmin(true);
        loadData();
        setLoading(false);
        
        adminService.getSettings().then(settings => {
          if (settings && settings.logoUrl) setSiteLogo(settings.logoUrl);
        });

        const handleLogoUpdate = () => {
          const newLogo = localStorage.getItem('siteLogo');
          if (newLogo) setSiteLogo(newLogo);
        };
        window.addEventListener('siteLogoUpdated', handleLogoUpdate);
        return () => {
          window.removeEventListener('siteLogoUpdated', handleLogoUpdate);
        };
      } catch (e) {
        localStorage.removeItem('customAdminUser');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const adminStatus = await adminService.isAdmin();
        setIsAdmin(adminStatus);
        if (adminStatus) {
           loadData();
           adminService.getSettings().then(settings => {
             if (settings && settings.logoUrl) setSiteLogo(settings.logoUrl);
           });
        }
      } else {
        const stillCustom = localStorage.getItem('customAdminUser');
        if (!stillCustom) {
          setUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    const handleLogoUpdate = () => {
      const newLogo = localStorage.getItem('siteLogo');
      if (newLogo) setSiteLogo(newLogo);
    };
    window.addEventListener('siteLogoUpdated', handleLogoUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('siteLogoUpdated', handleLogoUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const { seedDatabase } = await import('../seed');
      await seedDatabase();
    } catch (e) {
      console.error('Seed error:', e);
    }
    
    try {
      const [p, o, c, u, mi] = await Promise.all([
        adminService.getProducts(),
        adminService.getOrders(),
        adminService.getCategories(),
        adminService.getUsers(),
        adminService.getManualInvoices()
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setCategories(c || []);
      setUsers(u || []);
      setManualInvoices(mi || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { id, type } = deleteConfirm;
      if (type === 'product') {
        await adminService.deleteProduct(id);
      } else if (type === 'category') {
        await adminService.deleteCategory(id);
      } else if (type === 'user') {
        await adminService.deleteUser(id);
      } else if (type === 'invoice') {
        await adminService.deleteManualInvoice(id);
      }
      setDeleteConfirm(null);
      loadData();
    } catch (e) {
      console.error('Delete error: ', e);
      setDeleteConfirm(null);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      alert('Login Error: ' + error.message + '\n\nPlease ensure this domain is added to Authorized Domains in Firebase Authentication settings.');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('customAdminUser');
    await signOut(auth);
    setIsAdmin(false);
    setUser(null);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const usernameDocId = loginUsername.trim().toLowerCase().replace(/\s+/g, '');
      const passwordVal = loginPassword.trim();

      // Retrieve their custom user profile details directly
      const userProfile = await adminService.getUserProfile(usernameDocId);
      
      if (userProfile && userProfile.password?.toString().trim() === passwordVal) {
        const customUser = {
          uid: usernameDocId,
          displayName: userProfile.name || loginUsername,
          email: userProfile.email || `${usernameDocId}@ahoroon.com`,
          role: userProfile.role || 'viewer',
          permissions: userProfile.permissions || [],
          isCustom: true,
          username: usernameDocId
        };
        setUser(customUser);
        setIsAdmin(true);
        localStorage.setItem('customAdminUser', JSON.stringify(customUser));
        loadData();
      } else {
        setLoginError('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।');
      }
    } catch (err) {
      console.error('Custom login error details:', err);
      setLoginError('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl text-center space-y-6 border border-gray-100">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
            <LayoutDashboard size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-black text-accent-deep">Admin Panel</h1>
            <p className="text-gray-500 text-sm">প্যানেলে প্রবেশ করতে অনুগ্রহ করে লগইন করুন।</p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4 text-left">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="space-y-1.55">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">ইউজারনেম / নাম</label>
              <input 
                required
                type="text"
                placeholder="ইউজারনেম লিখুন"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.55">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">পাসওয়ার্ড</label>
              <input 
                required
                type="password"
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-accent-deep text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-lg"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'লগইন করুন'
              )}
            </button>
          </form>

          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-3 bg-white text-xs text-gray-400 font-bold">অথবা</span>
          </div>

          <button 
            type="button"
            onClick={handleLogin}
            className="w-full bg-primary/10 text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/25 transition-all"
          >
            Google দিয়ে লগইন করুন
          </button>
          {!isAdmin && user && (
            <p className="text-red-500 text-xs font-bold mt-2">আপনার এডমিন প্যানেলে অ্যাক্সেস করার অনুমতি নেই।</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-surface overflow-hidden">
      {/* Mobile Top Header (Slick & modern navigation for mobile screen sizes) */}
      <header className="lg:hidden bg-white border-b border-gray-100 flex items-center justify-between px-5 py-4 shrink-0 shadow-xs z-30">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 -ml-2.5 rounded-2xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        >
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          {siteLogo ? (
            <img src={siteLogo} alt="আহরোণ" className="h-9 w-auto object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span className="font-logo text-xl text-[#005900] logo-text">আহরোণ</span>
          )}
          <span className="text-xs bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">Admin</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs overflow-hidden shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user?.displayName || 'Admin'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={16} />
          )}
        </div>
      </header>

      {/* Dynamic Slide-out Drawer Panel Sidebar for touch screens */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Slide-out Drawer Panel Container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl border-r border-slate-100 z-50 flex flex-col lg:hidden"
            >
              {/* Drawer Header Brand Profile */}
              <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {siteLogo ? (
                    <img src={siteLogo} alt="আহরোণ" className="h-9 w-auto object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="font-logo text-2xl text-[#005900] logo-text">আহরোণ</span>
                  )}
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-black border border-emerald-150 px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">Admin</span>
                </div>
                
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto min-h-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <SidebarItem 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={ImageIcon} 
                  label="Hero Sliders" 
                  active={activeTab === 'sliders'} 
                  onClick={() => { setActiveTab('sliders'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={Package} 
                  label="Products" 
                  active={activeTab === 'products'} 
                  onClick={() => { setActiveTab('products'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={ShoppingCart} 
                  label="Orders" 
                  active={activeTab === 'orders'} 
                  onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={Tag} 
                  label="Categories" 
                  active={activeTab === 'categories'} 
                  onClick={() => { setActiveTab('categories'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={Users} 
                  label="Users" 
                  active={activeTab === 'users'} 
                  onClick={() => { setActiveTab('users'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={ReceiptText} 
                  label="Sales"
                  active={activeTab === 'invoices'} 
                  onClick={() => { setActiveTab('invoices'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={Sparkles} 
                  label="Producers" 
                  active={activeTab === 'producers'} 
                  onClick={() => { setActiveTab('producers'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={Newspaper} 
                  label="Newspaper (Press)" 
                  active={activeTab === 'press'} 
                  onClick={() => { setActiveTab('press'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
                <SidebarItem 
                  icon={SettingsIcon} 
                  label="Site Settings (Logo)" 
                  active={activeTab === 'settings'} 
                  onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }} 
                  showLabel
                />
              </nav>

              {/* Drawer Footer Logout */}
              <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <button 
                  onClick={() => { handleLogout(); setIsMobileSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 p-3.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="p-6 flex justify-start">
          {siteLogo ? (
            <img 
              src={siteLogo} 
              alt="আহরোণ" 
              className="h-10 w-auto object-contain animate-fade-in"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-logo text-2xl text-[#005900] logo-text">আহরোণ</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 pt-4 overflow-y-auto pb-6">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            showLabel
          />
          <SidebarItem 
            icon={ImageIcon} 
            label="Hero Sliders" 
            active={activeTab === 'sliders'} 
            onClick={() => setActiveTab('sliders')} 
            showLabel
          />
          <SidebarItem 
            icon={Package} 
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
            showLabel
          />
          <SidebarItem 
            icon={ShoppingCart} 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
            showLabel
          />
          <SidebarItem 
            icon={Tag} 
            label="Categories" 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')} 
            showLabel
          />
          <SidebarItem 
            icon={Users} 
            label="Users" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
            showLabel
          />
          <SidebarItem 
            icon={ReceiptText} 
            label="Sales" 
            active={activeTab === 'invoices'} 
            onClick={() => setActiveTab('invoices')} 
            showLabel
          />
          <SidebarItem 
            icon={Sparkles} 
            label="Producers" 
            active={activeTab === 'producers'} 
            onClick={() => setActiveTab('producers')} 
            showLabel
          />
          <SidebarItem 
            icon={Newspaper} 
            label="Newspaper (Press)" 
            active={activeTab === 'press'} 
            onClick={() => setActiveTab('press')} 
            showLabel
          />
          <SidebarItem 
            icon={SettingsIcon} 
            label="Site Settings (Logo)" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            showLabel
          />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3.5 text-gray-400 hover:text-red-500 transition-colors rounded-xl font-bold text-sm cursor-pointer"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 min-w-0">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-black text-accent-deep capitalize">
              {activeTab === 'invoices' ? 'All Sales' : activeTab}
            </h1>
            <p className="text-gray-500 text-sm">Welcome back, Admin</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => {
                  setEditingProduct({});
                  setIsModalOpen(true);
                }}
                className="bg-primary text-white p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group"
              >
                <Plus size={20} />
                <span className="hidden sm:block">Add Product</span>
              </button>
            )}
            {activeTab === 'users' && (
              <button 
                onClick={() => {
                  setEditingUser({});
                  setIsUserModalOpen(true);
                }}
                className="bg-primary text-white p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group"
              >
                <Plus size={20} />
                <span className="hidden sm:block">Add User</span>
              </button>
            )}
            {activeTab === 'invoices' && (
              <button 
                onClick={() => {
                  setEditingManualInvoice({});
                  setIsManualInvoiceModalOpen(true);
                }}
                className="bg-primary text-white p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group"
              >
                <Plus size={20} />
                <span className="hidden sm:block">Add New Sale</span>
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard label="Total Products" value={products.length} icon={Package} color="bg-blue-500" />
              <StatsCard label="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-purple-500" />
              <StatsCard label="Categories" value={categories.length} icon={Tag} color="bg-orange-500" />
              <StatsCard label="Users" value={users.length} icon={Users} color="bg-emerald-500" />
              <StatsCard label="Sales" value={manualInvoices.length} icon={ReceiptText} color="bg-rose-500" />
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-display font-black mb-6">Recent Orders</h3>
              <OrdersTable orders={orders.slice(0, 5)} onUpdateStatus={loadData} onView={setViewingOrder} />
            </div>
          </div>
        )}

        {activeTab === 'sliders' && (
          <AdminSliders />
        )}

        {activeTab === 'producers' && (
          <AdminProducers />
        )}

        {activeTab === 'press' && (
          <AdminPress />
        )}

        {activeTab === 'settings' && (
          <AdminSettings />
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <ProductsTable 
              products={products} 
              categories={categories}
              onEdit={(p) => {
                setEditingProduct(p);
                setIsModalOpen(true);
              }}
              onDelete={(id) => {
                const prod = products.find(p => p.id === id);
                setDeleteConfirm({
                  id,
                  type: 'product',
                  title: 'Delete Product',
                  message: `Are you sure you want to permanently delete the product "${prod?.name || ''}"?`
                });
              }}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <OrdersTable orders={orders} onUpdateStatus={loadData} onView={setViewingOrder} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={`cat-grid-${cat.id || 'cat'}-${idx}`} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all shadow-sm hover:shadow-lg">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 bg-surface rounded-2xl flex-shrink-0 flex items-center justify-center text-primary shadow-inner">
                    <CategoryIcon name={cat.icon} size={24} />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-accent-deep truncate">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter block truncate opacity-50">{cat.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCategoryModalOpen(true);
                    }}
                    className="p-2 text-gray-300 hover:text-primary transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteConfirm({
                        id: cat.id,
                        type: 'category',
                        title: 'Delete Category',
                        message: `Are you sure you want to delete category "${cat.name}"? Active products in this category will remain, but their category associations may be broken.`
                      });
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                setEditingCategory({});
                setIsCategoryModalOpen(true);
              }}
              className="border-2 border-dashed border-gray-200 p-6 rounded-3xl flex items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-all bg-white/50 hover:bg-white group"
            >
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">Add Category</span>
            </button>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <UsersTable 
              users={users} 
              onEdit={(u: any) => {
                setEditingUser(u);
                setIsUserModalOpen(true);
              }}
              onDelete={(id: string) => {
                const usr = users.find(u => u.id === id);
                setDeleteConfirm({
                  id,
                  type: 'user',
                  title: 'Delete User Account',
                  message: `Are you sure you want to delete user account "${usr?.name || usr?.email || ''}"?`
                });
              }}
            />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <InvoicesTable 
              invoices={manualInvoices} 
              onView={(inv: any) => {
                setViewingInvoice(inv);
                setIsManualInvoicePrintOpen(true);
              }}
              onDelete={(id: string) => {
                const inv = manualInvoices.find(i => i.id === id);
                setDeleteConfirm({
                  id,
                  type: 'invoice',
                  title: 'Delete Sale',
                  message: `Are you sure you want to permanently delete custom sale #${inv?.invoiceNo || inv?.invoiceNumber || ''}?`
                });
              }}
            />
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <ProductModal 
            product={editingProduct} 
            onClose={() => setIsModalOpen(false)} 
            onSave={loadData} 
            categories={categories}
          />
        )}
        {isCategoryModalOpen && (
          <CategoryModal 
            category={editingCategory} 
            onClose={() => setIsCategoryModalOpen(false)} 
            onSave={loadData} 
          />
        )}
        {isUserModalOpen && (
          <UserModal 
            user={editingUser} 
            onClose={() => setIsUserModalOpen(false)} 
            onSave={loadData} 
          />
        )}
        {isManualInvoiceModalOpen && (
          <ManualInvoiceModal 
            invoice={editingManualInvoice} 
            onClose={() => setIsManualInvoiceModalOpen(false)} 
            onSave={loadData} 
            products={products}
          />
        )}
        {viewingOrder && (
          <OrderDetailsModal 
            order={viewingOrder} 
            onClose={() => setViewingOrder(null)} 
            onInvoice={() => setIsInvoiceOpen(true)}
          />
        )}
        {isInvoiceOpen && viewingOrder && (
          <InvoiceModal 
            order={viewingOrder} 
            onClose={() => setIsInvoiceOpen(false)} 
          />
        )}
        {isManualInvoicePrintOpen && viewingInvoice && (
          <InvoiceModal 
            order={{
              ...viewingInvoice,
              customerName: viewingInvoice.customer.name,
              phoneNumber: viewingInvoice.customer.phone,
              address: viewingInvoice.customer.address,
              items: viewingInvoice.items.map((it: any) => ({
                ...it,
                cartQuantity: it.quantity,
                image: 'https://placehold.co/100x100?text=Manual+Item'
              }))
            }}
            onClose={() => setIsManualInvoicePrintOpen(false)} 
          />
        )}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl p-6 relative border border-gray-100 text-center"
            >
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-primary transition-colors hover:bg-surface rounded-full"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-display font-black text-accent-deep mb-2">
                {deleteConfirm.title}
              </h3>
              <p className="text-gray-500 text-xs mb-6">
                {deleteConfirm.message || 'Are you sure you want to permanently delete this item? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-surface text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, showLabel }: { icon: any, label: string, active: boolean, onClick: () => void, showLabel?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm group",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:bg-surface hover:text-primary"
      )}
    >
      <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-primary flex-shrink-0")} />
      <span className={cn(showLabel ? "block" : "hidden lg:block", "truncate")}>{label}</span>
    </button>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-display font-black text-accent-deep">{value}</p>
      </div>
    </div>
  );
}

function ProductsTable({ products, categories, onEdit, onDelete }: any) {
  const getCategoryName = (id: string) => {
    return categories.find((c: any) => c.id === id)?.name || id;
  };

  return (
    <div>
      {/* Mobile Stack Cards Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {products.map((p: Product, idx: number) => (
          <div key={`product-card-${p.id || 'new'}-${idx}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative shadow-sm shrink-0">
                {p.image ? (
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                    }}
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-black text-accent-deep text-base truncate mb-1">{p.name}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="bg-surface px-2.5 py-1 rounded-full text-[11px] font-bold text-primary uppercase border border-primary/10">
                    {getCategoryName(p.category)}
                  </span>
                  {p.size && (
                    <span className="text-[11px] text-gray-500 font-bold bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-wide">
                      {p.size} {p.unit || 'pcs'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap gap-2 text-sm">
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Price (মূল্য)</span>
                <span className="font-extrabold text-base text-accent-deep">৳{p.price}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Stock (স্টক)</span>
                {p.stock === undefined || p.stock === null ? (
                  <span className="text-gray-500 font-bold">-</span>
                ) : p.stock <= 0 ? (
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wide border border-red-100">Stock Out</span>
                ) : p.stock <= 5 ? (
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-black uppercase font-mono tracking-wide border border-amber-100">Low ({p.stock})</span>
                ) : (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-black uppercase font-mono tracking-wide border border-green-100">{p.stock}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Type (টাইপ)</span>
                {p.isFlashSale ? (
                  <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-md text-xs font-black uppercase border border-orange-100 flex items-center gap-1">
                    <Clock size={12} className="shrink-0 animate-pulse" /> FLASH
                  </span>
                ) : (
                  <span className="bg-gray-50 text-gray-500 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-100">Regular</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50">
              <button 
                onClick={() => onEdit(p)}
                className="flex items-center gap-1 px-3 py-2 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-xs font-bold transition-all"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                onClick={() => onDelete(p.id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-8 text-gray-400 font-medium">No products found (কোনো পণ্য পাওয়া যায়নি)</div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Product (পণ্য)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Category (ক্যাটেগরি)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Price (মূল্য)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Stock (স্টক)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Status (স্ট্যাটাস)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p: Product, idx: number) => (
              <tr key={`product-row-${p.id || 'new'}-${idx}`} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative shadow-sm">
                      {p.image ? (
                        <img 
                          src={p.image} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <ImageIcon size={22} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <span className="block font-black text-accent-deep text-base md:text-lg line-clamp-1 mb-1">{p.name}</span>
                      {p.size && (
                        <span className="text-xs text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-wide">
                          {p.size} {p.unit || 'pcs'}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-surface px-3 py-1.5 rounded-full text-xs font-bold text-primary uppercase border border-primary/10">{getCategoryName(p.category)}</span>
                </td>
                <td className="px-6 py-5 font-extrabold text-base text-accent-deep whitespace-nowrap">৳{p.price}</td>
                <td className="px-6 py-5">
                  {p.stock === undefined || p.stock === null ? (
                    <span className="text-gray-400 text-xs">-</span>
                  ) : p.stock <= 0 ? (
                    <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border border-red-105">Stock Out</span>
                  ) : p.stock <= 5 ? (
                    <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase font-mono tracking-wide border border-amber-105">Low Stock ({p.stock})</span>
                  ) : (
                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase font-mono tracking-wide border border-green-105">{p.stock} {p.unit || 'pcs'}</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  {p.isFlashSale ? (
                    <span className="flex items-center gap-1.5 text-orange-600 font-black text-xs uppercase bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 w-max">
                      <Clock size={14} className="animate-pulse" /> FLASH
                    </span>
                  ) : (
                    <span className="text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 font-bold text-xs">Regular</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => onEdit(p)}
                      className="p-2 sm:p-2.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Edit Product"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => onDelete(p.id)}
                      className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersTable({ orders, onUpdateStatus, onView }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-500 bg-emerald-50';
      case 'shipped': return 'text-blue-500 bg-blue-50';
      case 'processing': return 'text-orange-500 bg-orange-50';
      case 'cancelled': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle2;
      case 'shipped': return Truck;
      case 'processing': return Clock;
      case 'cancelled': return AlertCircle;
      default: return Clock;
    }
  };

  return (
    <div>
      {/* Mobile Stack Cards Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((o: any, idx: number) => {
          const Icon = getStatusIcon(o.status);
          return (
            <div key={`order-card-${o.id || 'order'}-${idx}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-primary font-black">
                  #{o.id ? o.id.slice(0, 8).toUpperCase() : 'NEW'}
                </span>
                <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border", getStatusColor(o.status))}>
                  <Icon size={12} className="shrink-0" /> {o.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-base font-black text-accent-deep">{o.customer?.name}</p>
                <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" /> {o.customer?.phone}
                </p>
                <p className="text-xs text-gray-400 font-medium italic line-clamp-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  {o.customer?.address}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap gap-2 text-sm">
                <div className="space-y-0.5">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Items</span>
                  <span className="font-semibold text-gray-700">{o.items.length} items</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Total</span>
                  <span className="font-black text-accent-deep">৳{o.total}</span>
                </div>
                <div className="space-y-0.5 flex-1 min-w-[120px] text-right">
                  <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider mb-1">Status (স্ট্যাটাস)</span>
                  <select 
                    value={o.status}
                    onChange={async (e) => {
                      await adminService.updateOrderStatus(o.id, e.target.value);
                      onUpdateStatus();
                    }}
                    className="text-xs font-bold bg-white border border-gray-200 rounded-xl p-1.5 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer w-full text-center"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-50">
                <button 
                  onClick={() => onView(o)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold border border-gray-200 shadow-sm transition-all w-full justify-center"
                >
                  <Eye size={16} /> View Details
                </button>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-400 font-medium">No orders found (কোনো অর্ডার পাওয়া যায়নি)</div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Order ID (অর্ডার আইডি)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Customer (গ্রাহক)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Items (আইটেম)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Total (মোট)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Status (স্ট্যাটাস)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 text-right">Update (আপডেট)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o: any, idx: number) => {
              const Icon = getStatusIcon(o.status);
              return (
                <tr key={`order-row-${o.id || 'order'}-${idx}`} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-5 font-mono text-sm text-primary font-black">#{o.id ? o.id.slice(0, 8).toUpperCase() : 'NEW'}</td>
                  <td className="px-6 py-5">
                    <div className="text-base font-black text-accent-deep mb-1">{o.customer?.name}</div>
                    <div className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {o.customer?.phone}</div>
                    <div className="text-xs text-gray-400 font-medium line-clamp-1 italic max-w-xs">{o.customer?.address}</div>
                  </td>
                  <td className="px-6 py-5 text-sm md:text-base font-semibold text-gray-700">{o.items.length} items</td>
                  <td className="px-6 py-5 font-black text-base text-accent-deep">৳{o.total}</td>
                  <td className="px-6 py-5">
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase border", getStatusColor(o.status))}>
                      <Icon size={14} /> {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3 items-center">
                      <button 
                        onClick={() => onView(o)}
                        className="p-2 text-gray-500 hover:text-primary transition-all bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-150"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                      <select 
                        value={o.status}
                        onChange={async (e) => {
                          await adminService.updateOrderStatus(o.id, e.target.value);
                          onUpdateStatus();
                        }}
                        className="text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryModal({ category, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    icon: category?.icon || 'Package'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (category?.id) {
        await adminService.updateCategory(category.id, formData);
      } else {
        await adminService.addCategory(formData as any);
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const icons = ['Package', 'Tag', 'Sparkles', 'ShoppingCart', 'LayoutGrid', 'LayoutDashboard', 'Utensils', 'Fish', 'Mountain'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-8">
          {category?.id ? 'Edit Category' : 'Add New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
            <input 
              required
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.name}
              onChange={e => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                setFormData({...formData, name, slug});
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Icon</label>
            <div className="grid grid-cols-5 gap-3">
              {icons.map((iconName, idx) => (
                <button
                  key={`icon-btn-${iconName}-${idx}`}
                  type="button"
                  onClick={() => setFormData({...formData, icon: iconName})}
                  className={cn(
                    "w-full aspect-square rounded-xl flex items-center justify-center transition-all",
                    formData.icon === iconName ? "bg-primary text-white shadow-lg" : "bg-surface text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <CategoryIcon name={iconName} size={20} />
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent-deep transition-all shadow-xl shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={20} /> {category?.id ? 'Update' : 'Save'} Category</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function OrderDetailsModal({ order, onClose, onInvoice }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl p-8 relative flex flex-col max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-2">Order Details</h2>
        <p className="text-primary font-mono text-xs font-bold mb-8">#{order.id}</p>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-3xl">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Customer Name
              </p>
              <p className="font-bold text-accent-deep">{order.customer?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} /> Phone Number
              </p>
              <p className="font-bold text-accent-deep">{order.customer?.phone}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> Shipping Address
              </p>
              <p className="font-bold text-accent-deep leading-relaxed">{order.customer?.address}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Items ({order.items.length})</h3>
            <div className="divide-y divide-gray-100 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {order.items.map((item: any, idx: number) => (
                <div key={`order-item-${item.id || 'item'}-${idx}`} className="p-4 flex items-center gap-4 hover:bg-surface/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-accent-deep truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {item.cartQuantity} {item.unit || 'pcs'} × ৳{item.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">৳{item.price * item.cartQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-accent-deep text-white p-6 rounded-3xl space-y-3">
            <div className="flex justify-between text-white/60 font-medium text-sm">
              <span>Subtotal</span>
              <span>৳{order.total}</span>
            </div>
            <div className="flex justify-between text-white/60 font-medium text-sm">
              <span>Delivery</span>
              <span>৳0</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="font-bold">Total Payable</span>
              <span className="text-2xl font-display font-black">৳{order.total}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 mt-6 flex gap-4">
          <button 
            onClick={onInvoice}
            className="flex-1 bg-surface text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border border-primary/10"
          >
            <FileText size={20} /> Generate Invoice
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-gray-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-surface transition-all border border-gray-100"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

  function InvoiceModal({ order, onClose }: any) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [logo, setLogo] = useState<string>(
      localStorage.getItem('siteLogo') || localStorage.getItem('siteFooterLogo') || ""
    );

    useEffect(() => {
      adminService.getSettings()
        .then(settings => {
          if (settings && settings.logoUrl) {
            setLogo(settings.logoUrl);
          }
        })
        .catch(err => console.error("Error loading settings in InvoiceModal:", err));
    }, []);
    
    const handlePrint = () => {
      // Native browser print is the most robust solution for A4/PDF
      window.print();
    };

    const handleDownloadPDF = async () => {
      if (!contentRef.current || isGenerating) return;
      setIsGenerating(true);
      
      const parseColorVal = (valStr: string, maxVal: number, isHue = false): number => {
        if (valStr.endsWith('%')) {
          return (parseFloat(valStr) / 100) * (isHue ? 360 : 1);
        }
        let v = parseFloat(valStr);
        if (isNaN(v)) return 0;
        if (isHue) return v;
        return v;
      };

      const oklabToRgbStr = (L: number, a: number, b: number, alpha: number): string => {
        const l_ = L + 0.3963377774 * a + 0.2157037208 * b;
        const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
        
        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;
        
        const rL = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
        const gL = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
        const bL = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
        
        const toSRGB = (c: number) => {
          if (c <= 0.0031308) return 12.92 * c;
          return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        };
        
        let r = Math.round(Math.max(0, Math.min(1, toSRGB(rL))) * 255);
        let g = Math.round(Math.max(0, Math.min(1, toSRGB(gL))) * 255);
        let bColor = Math.round(Math.max(0, Math.min(1, toSRGB(bL))) * 255);
        
        if (alpha === 1) {
          return `rgb(${r}, ${g}, ${bColor})`;
        } else {
          return `rgba(${r}, ${g}, ${bColor}, ${alpha})`;
        }
      };

      const oklchToRgb = (innerStr: string): string => {
        const parts = innerStr.trim().split(/[\s/]+/).filter(Boolean);
        if (parts.length < 3) return '#10b981';
        let L = parseColorVal(parts[0], 1);
        let C = parseColorVal(parts[1], 0.4);
        let H = parseColorVal(parts[2], 360, true);
        let alpha = parts[3] !== undefined ? parseColorVal(parts[3], 1) : 1;
        const hRad = (H * Math.PI) / 180;
        const a = C * Math.cos(hRad);
        const b = C * Math.sin(hRad);
        return oklabToRgbStr(L, a, b, alpha);
      };

      const oklabToRgb = (innerStr: string): string => {
        const parts = innerStr.trim().split(/[\s/]+/).filter(Boolean);
        if (parts.length < 3) return '#10b981';
        let L = parseColorVal(parts[0], 1);
        let a = parseColorVal(parts[1], 1);
        let b = parseColorVal(parts[2], 1);
        let alpha = parts[3] !== undefined ? parseColorVal(parts[3], 1) : 1;
        return oklabToRgbStr(L, a, b, alpha);
      };

      const replaceOklchAndOklab = (str: string): string => {
        if (typeof str !== 'string') return str;
        let res = str;
        res = res.replace(/oklch\(([^)]+)\)/g, (_, inner) => {
          try { return oklchToRgb(inner); } catch (e) { return '#10b981'; }
        });
        res = res.replace(/oklab\(([^)]+)\)/g, (_, inner) => {
          try { return oklabToRgb(inner); } catch (e) { return '#10b981'; }
        });
        return res;
      };

      const originalGetComputedStyle = window.getComputedStyle;
      
      const cssStyleDeclarationHandler = {
        get(target: any, prop: string | symbol, receiver: any) {
          if (prop === 'getPropertyValue') {
            return function(this: any, property: string) {
              const val = target.getPropertyValue(property);
              return replaceOklchAndOklab(val);
            };
          }
          const value = Reflect.get(target, prop, receiver);
          if (typeof prop === 'string' && typeof value === 'string') {
            return replaceOklchAndOklab(value);
          }
          if (typeof value === 'function') {
            return value.bind(target);
          }
          return value;
        }
      };

      try {
        window.getComputedStyle = function(elt, pseudoElt) {
          const style = originalGetComputedStyle(elt, pseudoElt);
          return new Proxy(style, cssStyleDeclarationHandler);
        };

        const element = contentRef.current;
        const opt = {
          margin: 0,
          filename: `Invoice-${order?.id?.slice(-8).toUpperCase() || 'MANUAL'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            onclone: (clonedDoc: Document) => {
              // html2canvas parser crashes on oklch() and oklab() colors.
              // We need to strip or replace oklch/oklab references in the cloned document's styles.
              const styles = clonedDoc.querySelectorAll('style');
              styles.forEach(style => {
                let content = style.textContent || '';
                if (content.includes('oklch') || content.includes('oklab')) {
                  content = content
                    .replace(/oklch\([^)]+\)/g, '#10b981')
                    .replace(/oklab\([^)]+\)/g, '#10b981');
                  style.textContent = content;
                }
              });
            }
          },
          jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        // Use html2pdf for high-quality PDF generation
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error('PDF Generation Error:', error);
        // Fallback to print (Save as PDF) if html2pdf fails
        window.print();
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        setIsGenerating(false);
      }
    };

  return (
    <motion.div 
      id="invoice-content-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-start bg-black/95 backdrop-blur-md overflow-y-auto py-24 px-2 sm:px-4"
    >
      {/* Controls - Sticky on Mobile */}
      <div className="fixed top-0 left-0 right-0 p-4 flex flex-wrap justify-center sm:justify-end gap-2 bg-black/50 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none sm:absolute sm:top-8 sm:right-8 z-[100] print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-all active:scale-95 text-sm sm:text-base"
        >
          <Printer size={16} className="sm:w-[18px]" /> Print <span className="hidden xs:inline">Invoice</span>
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-accent-deep text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-all active:scale-95 text-sm sm:text-base disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Download size={16} className="sm:w-[18px]" />
          )}
          <span className="hidden xs:inline">{isGenerating ? 'Wait...' : 'Save PDF'}</span>
        </button>
        <button 
          onClick={onClose}
          className="bg-white/10 text-white p-2.5 sm:p-3 rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all ml-1 sm:ml-0"
        >
          <X size={20} className="sm:w-6" />
        </button>
      </div>

      <div className="w-full max-w-full overflow-x-auto flex justify-start md:justify-center py-6 print:py-0 print:overflow-visible">
        <div 
          ref={contentRef} 
          className="bg-white w-[210mm] h-[297mm] min-h-[297mm] max-h-[297mm] p-10 shadow-2xl relative print:shadow-none flex flex-col justify-between box-border overflow-hidden select-none shrink-0" 
          id="invoice-content"
          style={{ width: '210mm', height: '297mm', minHeight: '297mm', maxHeight: '297mm', boxSizing: 'border-box' }}
        >
          <div>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 border-b border-gray-200 pb-6">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  {logo ? (
                    <img 
                      src={logo} 
                      alt="আহরোণ" 
                      className="h-12 w-auto object-contain print:max-h-12 pb-1" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-white rotate-3 shadow-lg shadow-primary/20 shrink-0">
                        <span className="text-xl sm:text-2xl font-black italic uppercase">আ</span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-display font-black text-primary italic tracking-tight uppercase leading-tight font-sans">
                        আহরোণ <span className="text-accent-deep not-italic text-lg sm:text-2xl block xs:inline">(Aharon)</span>
                      </h1>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-extrabold uppercase text-[10px] text-gray-400 tracking-wider">Quality food products from bengal</p>
                  <p>Mohammadpur, Bosila, Dhaka, Bangladesh 1207</p>
                  <p>TIN: 123456789101 | BIN: 001234567-0101</p>
                  <p>Support: +8801796361024 | info@ahoron.com</p>
                </div>
              </div>
              <div className="w-full md:w-auto text-left md:text-right space-y-2 pt-4 md:pt-0 border-t border-gray-100 md:border-0">
                <h2 className="text-3xl font-display font-black text-primary tracking-widest uppercase">INVOICE</h2>
                <div className="space-y-1 text-sm font-bold text-gray-600">
                  <div className="flex justify-start md:justify-end gap-2">
                    <span className="text-gray-400 uppercase tracking-wider text-xs">Invoice No:</span>
                    <span className="text-accent-deep">#{ (order.invoiceNo || order.id).slice(-8).toUpperCase() }</span>
                  </div>
                  <div className="flex justify-start md:justify-end gap-2">
                    <span className="text-gray-400 uppercase tracking-wider text-xs">Date:</span>
                    <span className="text-accent-deep">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section - Simple Text Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border-b border-gray-200 pb-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing To (বিলিং তথ্য)</h3>
                <div className="space-y-1 block whitespace-normal">
                  <p className="text-lg font-black text-accent-deep">{order.customerName || order.customer?.name}</p>
                  <p className="text-sm text-gray-600 font-bold">Phone: {order.phoneNumber || order.customer?.phone}</p>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm">{order.address || order.customer?.address}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Details (পেমেন্ট তথ্য)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Payment Method:</span>
                    <span className="font-extrabold text-accent-deep">{order.paymentMethod || 'Cash on Delivery'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Total Items:</span>
                    <span className="font-extrabold text-accent-deep">{order.items?.reduce((acc: number, item: any) => acc + (item.cartQuantity || item.quantity || 1), 0) || 0} Units</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-500 font-bold">Payment Status:</span>
                    <span className="font-extrabold text-green-600">{order.status?.toUpperCase() || 'PAID'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table - Simple Minimalist */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 text-xs text-gray-500 uppercase tracking-wider font-bold">
                    <th className="py-2.5 text-left w-12 font-extrabold">No</th>
                    <th className="py-2.5 text-left font-extrabold">Item Description</th>
                    <th className="py-2.5 text-center w-20 font-extrabold">Qty</th>
                    <th className="py-2.5 text-right w-28 font-extrabold">Unit Price</th>
                    <th className="py-2.5 text-right w-28 font-extrabold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-sm">
                  {order.items?.map((item: any, i: number) => (
                    <tr key={`inv-item-${item.id || 'inv'}-${i}`} className="hover:bg-gray-50/50">
                      <td className="py-3 text-gray-400 font-bold">{(i + 1).toString().padStart(2, '0')}</td>
                      <td className="py-3">
                        <p className="font-extrabold text-accent-deep text-xs sm:text-sm">{item.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Unit: {item.unit || 'pcs'}</p>
                      </td>
                      <td className="py-3 text-center font-extrabold text-gray-700">
                        {item.cartQuantity || item.quantity || 1}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-600">৳{item.price}</td>
                      <td className="py-3 text-right font-extrabold text-accent-deep">৳{item.price * (item.cartQuantity || item.quantity || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {/* Summary Footer */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-t border-gray-200 pt-6">
              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Terms & Conditions</h4>
                  <ul className="text-xs text-gray-500 space-y-1 pl-4 list-disc leading-relaxed">
                    <li>Goods once sold are not returnable without valid reason.</li>
                    <li>Please keep this invoice for any warranty claims.</li>
                    <li>This is a computer-generated invoice, no signature is required.</li>
                  </ul>
                </div>
              </div>

              <div className="w-full md:w-85 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                  <span>Basic Amount:</span>
                  <span className="font-extrabold text-accent-deep">৳{order.total}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
                  <span>Delivery Charge:</span>
                  <span className="text-green-600 font-extrabold">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 font-medium border-b border-gray-200 pb-2">
                  <span>Discount:</span>
                  <span className="text-rose-600 font-extrabold">৳0</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-accent-deep uppercase tracking-wider">NET TOTAL</span>
                  <span className="text-3xl font-display font-black text-primary">৳{order.total}</span>
                </div>
                
                <div className="pt-8 text-center font-bold">
                  <div className="w-32 h-px bg-gray-300 mx-auto mb-1" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Authorized Signature</p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 py-3 border-t border-gray-50 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Official Invoice &copy; {new Date().getFullYear()} Aharon Shopping | MOHAMMADPUR DHAKA</p>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest italic font-sans leading-none">A product of info@ahoron.com</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductModal({ product, onClose, onSave, categories }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || categories[0]?.id || '',
    description: product?.description || '',
    image: product?.image || '',
    isFlashSale: product?.isFlashSale || false,
    isPopular: product?.isPopular || false,
    isFeatured: product?.isFeatured || false,
    discount: product?.discount || 0,
    images: product?.images || [],
    unit: product?.unit || 'pcs',
    size: product?.size || 1,
    moq: product?.moq || 1,
    step: product?.step || 1,
    stock: product?.stock !== undefined ? product.stock : 100
  });
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    if (!formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [categories]);

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      alert('Please enter a product name first');
      return;
    }
    setGeneratingAi(true);
    try {
      const desc = await aiService.generateProductDescription(formData.name, formData.category);
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (e) {
      alert('AI Generation failed. Please try again.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.name) {
      alert('Please enter a product name first');
      return;
    }
    setGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: formData.name }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }
      
      setFormData(prev => ({ ...prev, image: data.image }));
    } catch (e: any) {
      alert(e.message || 'AI Generation failed. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(async (file: File) => {
      if (formData.images.length >= 5) {
        alert('Maximum 5 gallery images allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const original = reader.result as string;
          // Compress to max 800px width/height, 0.6 quality
          const compressed = await compressImage(original, 800, 800, 0.6);
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, compressed]
          }));
        } catch (err) {
          console.error('Compression failed:', err);
          alert('Could not process image');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product?.id) {
        await adminService.updateProduct(product.id, formData);
      } else {
        await adminService.addProduct(formData as any);
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-8">
          {product?.id ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</label>
              <input 
                required
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (৳)</label>
              <input 
                required
                type="number"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unit</label>
              <select 
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value as any})}
              >
                <option value="pcs">Pcs</option>
                <option value="gm">Gram (gm)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="l">Litre (L)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size / Quantity</label>
              <input 
                required
                type="number"
                step="0.01"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.size}
                onChange={e => setFormData({...formData, size: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Order Qty (MOQ)</label>
              <input 
                required
                type="number"
                step="0.001"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.moq}
                onChange={e => setFormData({...formData, moq: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step (Increment)</label>
              <input 
                required
                type="number"
                step="0.001"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.step}
                onChange={e => setFormData({...formData, step: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
              <select 
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map((c: any, idx: number) => (
                  <option key={`admin-cat-opt-${c.id || 'opt'}-${idx}`} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock Quantity (স্টক পরিমাণ)</label>
              <input 
                required
                type="number"
                min="0"
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isPopular}
                    onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured}
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm font-bold text-gray-700">Featured</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Image</label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <img 
                    src={formData.image} 
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100" 
                    alt="Preview" 
                  />
                )}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-surface rounded-2xl text-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/5 transition-all disabled:opacity-50"
                >
                  {generatingImage ? <Sparkles className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {generatingImage ? 'Generating...' : 'Generate with AI'}
                </button>
                <label className="flex-1 cursor-pointer">
                  <div className="w-full bg-surface p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary transition-all flex items-center justify-center gap-2 text-gray-400 font-bold text-sm">
                    <Plus size={18} />
                    <span>Upload Image</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] as File;
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          try {
                            const original = reader.result as string;
                            const compressed = await compressImage(original, 800, 800, 0.6);
                            setFormData({ ...formData, image: compressed });
                          } catch (err) {
                            console.error('Compression failed:', err);
                            alert('Could not process image');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <button 
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingAi}
                className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {generatingAi ? (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                AI Auto-generate
              </button>
            </div>
            <textarea 
              required
              rows={4}
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
              placeholder="Enter product details or use AI to generate..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <LayoutGrid size={16} />
              <label className="text-xs font-bold uppercase tracking-widest">Gallery Images (Max 5)</label>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {formData.images.map((img, idx) => (
                <div key={`admin-prod-gal-${idx}`} className="relative group">
                  <img 
                    src={img} 
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm" 
                    alt={`Gallery ${idx}`} 
                  />
                  <button 
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {formData.images.length < 5 && (
                <label className="w-20 h-20 bg-surface rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary transition-all flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:bg-white overflow-hidden">
                  <Plus size={20} />
                  <span className="text-[8px] font-bold uppercase">Add</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 bg-surface rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox"
                className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-gray-300"
                checked={formData.isFlashSale}
                onChange={e => setFormData({...formData, isFlashSale: e.target.checked})}
              />
              <span className="text-sm font-bold text-accent-deep">Flash Sale</span>
            </label>
            {formData.isFlashSale && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Discount (%)</span>
                <input 
                  type="number"
                  className="w-20 bg-white p-2 rounded-xl outline-none border border-gray-100"
                  value={formData.discount}
                  onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent-deep transition-all shadow-xl shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={20} /> {product?.id ? 'Update' : 'Save'} Product</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function UsersTable({ users, onEdit, onDelete }: any) {
  return (
    <div>
      {/* Mobile Stack Cards Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((u: any, idx: number) => (
          <div key={`user-card-${u.id || 'user'}-${idx}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base shadow-inner">
                {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-accent-deep mb-0.5 truncate">{u.name || 'No Name'}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs text-gray-500 font-medium truncate">{u.email}</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border lowercase",
                    u.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : 
                    u.role === 'editor' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-500 border-gray-150"
                  )}>
                    {u.role}
                  </span>
                </div>
              </div>
            </div>

            {u.password && (
              <div className="bg-yellow-50 p-2.5 rounded-xl border border-yellow-105 flex items-center justify-between text-xs">
                <span className="text-yellow-800 font-bold">Password (পাসওয়ার্ড):</span>
                <span className="font-mono font-black text-yellow-700 bg-white px-2 py-0.5 rounded border border-yellow-100">{u.password}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block">Permissions (অনুমোদন):</span>
              <div className="flex flex-wrap gap-1.5">
                {(u.permissions || []).map((p: string, i: number) => (
                  <span key={`user-perm-${u.id || 'new'}-${p}-${i}`} className="text-xs bg-surface px-2.5 py-1 rounded-lg border border-gray-100 text-gray-500 font-bold uppercase tracking-wide">
                    {p}
                  </span>
                ))}
                {(!u.permissions || u.permissions.length === 0) && <span className="text-xs text-gray-400 italic">None</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50">
              <button 
                onClick={() => onEdit(u)}
                className="flex items-center gap-1 px-3 py-2 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-xs font-bold transition-all"
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                onClick={() => onDelete(u.id)}
                className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-400 font-medium">No users found (কোনো ব্যবহারকারী পাওয়া যায়নি)</div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">User (ব্যবহারকারী)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Role (ভূমিকা)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Permissions (অনুমোদন)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: any, idx: number) => (
              <tr key={`user-row-${u.id || 'user'}-${idx}`} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base shadow-inner">
                      {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-black text-accent-deep mb-1">{u.name || 'No Name'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                        {u.password && (
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-105 font-mono font-bold text-xs">
                            Pass: {u.password}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 lowercase">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold border",
                    u.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : 
                    u.role === 'editor' ? "bg-blue-50 text-blue-600 border-blue-105" : "bg-gray-50 text-gray-500 border-gray-150"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5">
                    {(u.permissions || []).map((p: string, i: number) => (
                      <span key={`user-perm-${u.id || 'new'}-${p}-${i}`} className="text-xs bg-surface px-2.5 py-1 rounded-lg border border-gray-100 text-gray-500 font-bold uppercase tracking-wide">
                        {p}
                      </span>
                    ))}
                    {(!u.permissions || u.permissions.length === 0) && <span className="text-xs text-gray-400">None</span>}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onEdit(u)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={20} /></button>
                    <button onClick={() => onDelete(u.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesTable({ invoices, onView, onDelete }: any) {
  return (
    <div>
      {/* Mobile Stack Cards Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {invoices.map((inv: any, idx: number) => (
          <div key={`inv-card-${inv.id || 'inv'}-${idx}`} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">Invoice: {inv.invoiceNo}</span>
              <span className="font-black text-sm text-accent-deep">৳{inv.total}</span>
            </div>

            <div className="space-y-1">
              <div className="text-base font-black text-accent-deep">{inv.customer?.name}</div>
              <div className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                <Phone size={12} className="text-gray-400" /> {inv.customer?.phone}
              </div>
            </div>

            <div className="text-xs text-gray-600 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
              <span>Items Summary:</span>
              <span className="font-bold">{inv.items?.length || 0} items</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50">
              <button 
                onClick={() => onView(inv)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl text-xs font-bold transition-all border border-primary/10"
              >
                <Printer size={16} /> Print
              </button>
              <button 
                onClick={() => onDelete(inv.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all border border-red-100"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-8 text-gray-400 font-medium">No sales found (কোনো সেলস পাওয়া যায়নি)</div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Invoice No (ইনভয়েস নং)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Customer (গ্রাহক)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Items (আইটেম)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500">Total (মোট)</th>
              <th className="px-6 py-5 text-xs md:text-sm font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv: any, idx: number) => (
              <tr key={`inv-row-${inv.id || 'inv'}-${idx}`} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-5 font-mono text-sm text-primary font-black">{inv.invoiceNo}</td>
                <td className="px-6 py-5">
                  <div className="text-base font-black text-accent-deep mb-1">{inv.customer?.name}</div>
                  <div className="text-xs text-gray-500 font-semibold flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {inv.customer?.phone}</div>
                </td>
                <td className="px-6 py-5 text-sm md:text-base font-semibold text-gray-700">
                  {inv.items?.length || 0} items
                </td>
                <td className="px-6 py-5 font-black text-base text-accent-deep">৳{inv.total}</td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onView(inv)} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/5 transition-all bg-white rounded-xl border border-gray-150 shadow-sm" title="Print Invoice"><Printer size={20} /></button>
                    <button onClick={() => onDelete(inv.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Invoice"><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: user?.password || '',
    role: user?.role || 'viewer',
    permissions: user?.permissions || []
  });
  const [loading, setLoading] = useState(false);

  const roles = ['admin', 'editor', 'viewer'];
  const allPermissions = ['products', 'orders', 'categories', 'users', 'invoices'];

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p: string) => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        password: formData.password.trim(),
        role: formData.role,
        permissions: formData.permissions,
        email: user?.email || (formData.name.trim().toLowerCase().replace(/\s+/g, '') + "@ahoroon.com")
      };
      if (user?.id) {
        await adminService.updateUser(user.id, payload);
      } else {
        await adminService.addUser(payload as any);
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-8">
          {user?.id ? 'Edit User' : 'Add New User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Name</label>
            <input 
              required
              placeholder="e.g. adon, admin, emran"
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 123456"
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
            <select 
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as any})}
            >
              {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map((p, pIdx) => (
                <button
                  key={`admin-perm-btn-${p}-${pIdx}`}
                  type="button"
                  onClick={() => togglePermission(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                    formData.permissions.includes(p) 
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-surface text-gray-400 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent-deep transition-all shadow-xl shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={20} /> {user?.id ? 'Update' : 'Save'} User</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ManualInvoiceModal({ invoice, onClose, onSave, products = [] }: any) {
  const [formData, setFormData] = useState({
    invoiceNo: invoice?.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
    customer: {
      name: invoice?.customer?.name || '',
      phone: invoice?.customer?.phone || '',
      address: invoice?.customer?.address || ''
    },
    items: invoice?.items || [{ name: '', price: 0, quantity: 1, unit: 'pcs' }],
    total: invoice?.total || 0,
    paymentMethod: invoice?.paymentMethod || 'Cash',
    status: invoice?.status || 'New Invoice'
  });
  const [loading, setLoading] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);

  useEffect(() => {
    const total = formData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    setFormData(prev => ({ ...prev, total }));
  }, [formData.items]);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: 0, quantity: 1, unit: 'pcs' }]
    }));
  };

  const removeItem = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== idx)
    }));
  };

  const updateItem = (idx: number, field: string | Record<string, any>, value?: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      if (typeof field === 'object') {
        newItems[idx] = { ...newItems[idx], ...field };
      } else {
        newItems[idx] = { ...newItems[idx], [field]: value };
      }
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Core stock validation: "Stock 0 product add kora jabe na"
    for (const item of formData.items) {
      if (!item.name) continue;
      const matched = products.find((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
      if (matched) {
        if (matched.stock !== undefined && matched.stock !== null) {
          if (matched.stock <= 0) {
            alert(`"${item.name}" is out of stock! (স্টক নেই!)`);
            return;
          }
          if (item.quantity > matched.stock) {
            alert(`"${item.name}" quantity (${item.quantity}) exceeds available stock (${matched.stock})!`);
            return;
          }
        }
      }
    }

    setLoading(true);
    try {
      if (invoice?.id) {
        await adminService.updateManualInvoice(invoice.id, formData);
      } else {
        await adminService.addManualInvoice(formData as any);
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-8 flex items-center gap-3">
          <ReceiptText /> {invoice?.id ? 'Edit Sale' : 'Add New Sale'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6 p-4 bg-surface rounded-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice No</label>
              <input 
                required
                className="w-full bg-white p-3 rounded-xl border border-gray-100 font-mono text-sm"
                value={formData.invoiceNo}
                onChange={e => setFormData({...formData, invoiceNo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
              <input 
                required
                className="w-full bg-white p-3 rounded-xl border border-gray-100 font-bold text-sm text-emerald-500"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required
                placeholder="Customer Name"
                className="w-full bg-surface p-4 rounded-xl outline-none border border-transparent focus:border-primary/20 "
                value={formData.customer.name}
                onChange={e => setFormData({...formData, customer: {...formData.customer, name: e.target.value}})}
              />
              <input 
                required
                placeholder="Phone Number"
                className="w-full bg-surface p-4 rounded-xl outline-none border border-transparent focus:border-primary/20 "
                value={formData.customer.phone}
                onChange={e => setFormData({...formData, customer: {...formData.customer, phone: e.target.value}})}
              />
              <textarea 
                required
                placeholder="Full Shipping Address"
                className="w-full md:col-span-2 bg-surface p-4 rounded-xl outline-none border border-transparent focus:border-primary/20 resize-none"
                value={formData.customer.address}
                rows={2}
                onChange={e => setFormData({...formData, customer: {...formData.customer, address: e.target.value}})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l-4 border-primary pl-3">Invoice Items</h3>
              <button type="button" onClick={addItem} className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item: any, idx: number) => {
                const matchedProd = products.find((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
                const maxQty = matchedProd && matchedProd.stock !== undefined && matchedProd.stock !== null ? matchedProd.stock : undefined;
                return (
                  <div key={`admin-manual-inv-item-${idx}`} className="flex gap-3 items-start bg-gray-50 p-4 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100">
                    <div className="flex-1 space-y-2 relative">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name / Product</label>
                      <div className="relative">
                        <input 
                          id="sale-product-search-input"
                          required
                          placeholder="Search product (খুঁজতে লিখুন)"
                          className="w-full bg-white p-3 pr-10 rounded-xl border border-gray-100 text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all font-bold"
                          value={item.name}
                          onChange={e => {
                            updateItem(idx, 'name', e.target.value);
                            setActiveDropdownIndex(idx);
                          }}
                          onFocus={() => setActiveDropdownIndex(idx)}
                        />
                        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>

                      {activeDropdownIndex === idx && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdownIndex(null)}
                          />
                          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-150 rounded-2xl shadow-xl z-20 divide-y divide-gray-50 py-1">
                            {products
                              .filter((p: any) => 
                                !item.name || p.name.toLowerCase().includes(item.name.toLowerCase())
                              )
                              .map((p: any) => {
                                const isOutOfStock = p.stock !== undefined && p.stock !== null && p.stock <= 0;
                                return (
                                  <button
                                    type="button"
                                    key={p.id}
                                    disabled={isOutOfStock}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateItem(idx, {
                                        name: p.name,
                                        price: p.price,
                                        unit: p.unit || 'pcs'
                                      });
                                      setActiveDropdownIndex(null);
                                    }}
                                    className={cn(
                                      "w-full text-left px-4 py-3 flex items-center justify-between text-sm transition-all",
                                      isOutOfStock 
                                        ? "bg-gray-50/50 text-gray-400 cursor-not-allowed opacity-60" 
                                        : "hover:bg-primary/5 text-accent-deep hover:text-primary active:bg-primary/10"
                                    )}
                                  >
                                    <div>
                                      <span className="font-extrabold block">{p.name}</span>
                                      {p.size && (
                                        <span className="text-[10px] text-gray-600 font-bold bg-gray-100 px-1.5 py-0.5 rounded-lg uppercase mt-1 inline-block">
                                          {p.size} {p.unit || 'pcs'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-sm block">৳{p.price}</span>
                                      {isOutOfStock ? (
                                        <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-black border border-red-100 uppercase tracking-wide">Stock Out (স্টক নেই)</span>
                                      ) : (
                                        <span className={cn(
                                          "text-[10px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-wide",
                                          p.stock <= 5 
                                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                                            : "bg-green-50 text-green-700 border-green-150"
                                        )}>
                                          Stock: {p.stock !== undefined && p.stock !== null ? p.stock : '∞'}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            {products.filter((p: any) => 
                              !item.name || p.name.toLowerCase().includes(item.name.toLowerCase())
                            ).length === 0 && (
                              <div className="px-4 py-4 text-xs text-gray-400 font-bold text-center">
                                No matching products (কোনো পণ্য মেলেনি)
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="w-24 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                      <input 
                        required
                        type="number"
                        className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold"
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', Number(e.target.value))}
                      />
                    </div>
                    <div className="w-20 space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                      <input 
                        required
                        type="number"
                        min={1}
                        max={maxQty}
                        className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold"
                        value={item.quantity}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (maxQty !== undefined && val > maxQty) {
                            alert(`Cannot add more than available stock (${maxQty})!`);
                            updateItem(idx, 'quantity', maxQty);
                          } else {
                            updateItem(idx, 'quantity', val);
                          }
                        }}
                      />
                      {maxQty !== undefined && (
                        <p className={cn(
                          "text-[9px] font-bold tracking-tight text-center truncate",
                          item.quantity > maxQty ? "text-red-600" : "text-gray-400"
                        )}>
                          Stock: {maxQty}
                        </p>
                      )}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeItem(idx)}
                      disabled={formData.items.length === 1}
                      className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-center mt-5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-accent-deep rounded-3xl text-white">
            <div className="space-y-4 w-full md:w-auto">
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Payment Method</label>
                <select 
                  className="bg-white/10 border border-white/20 rounded-xl p-3 text-sm focus:bg-white/20 outline-none w-full text-white cursor-pointer [&>option]:text-gray-900"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="COD - Cash on delivery">COD - Cash on delivery</option>
                  <option value="Paid">Paid</option>
                  <option value="Due">Due</option>
                </select>
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <p className="text-sm font-bold text-white/50 uppercase">Grand Total</p>
              <p className="text-4xl font-display font-black">৳{formData.total}</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all shadow-2xl shadow-primary/30 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={24} /> {invoice?.id ? 'Update Sale' : 'Create & Save Sale'}</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
