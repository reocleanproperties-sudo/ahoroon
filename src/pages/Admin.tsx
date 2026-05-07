import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  Plus, 
  Search, 
  MoreVertical, 
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
  LayoutGrid
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { adminService } from '../services/adminService';
import { aiService } from '../services/aiService';
import { Product, Category } from '../types';
import { cn } from '../lib/utils';
import { CategoryIcon } from '../components/CategoryIcon';
import { compressImage } from '../lib/imageUtils';

type Tab = 'dashboard' | 'products' | 'orders' | 'categories';

export default function Admin() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const adminStatus = await adminService.isAdmin();
        setIsAdmin(adminStatus);
        if (adminStatus) {
           loadData();
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const { seedDatabase } = await import('../seed');
      await seedDatabase();
    } catch (e) {
      console.error('Seed error:', e);
    }
    
    try {
      const [p, o, c] = await Promise.all([
        adminService.getProducts(),
        adminService.getOrders(),
        adminService.getCategories()
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setCategories(c || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
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
            <p className="text-gray-500 text-sm">Please log in with an admin account to continue.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent-deep transition-all shadow-lg shadow-primary/20"
          >
            Google দিয়ে লগইন করুন
          </button>
          {!isAdmin && user && (
            <p className="text-red-500 text-xs font-bold">You do not have admin permissions.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6">
          <div className="logo-text text-2xl hidden md:block">আহরোণ</div>
          <div className="w-10 h-10 bg-primary rounded-xl md:hidden flex items-center justify-center text-white">আ</div>
        </div>

        <nav className="flex-1 px-4 space-y-2 pt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Package} 
            label="Products" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarItem 
            icon={ShoppingCart} 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <SidebarItem 
            icon={Tag} 
            label="Categories" 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-500 transition-colors rounded-xl font-bold text-sm"
          >
            <LogOut size={20} />
            <span className="hidden md:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-black text-accent-deep capitalize">{activeTab}</h1>
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
                className="bg-primary text-white p-2 md:px-4 md:py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group"
              >
                <Plus size={20} />
                <span className="hidden md:block">Add Product</span>
              </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard label="Total Products" value={products.length} icon={Package} color="bg-blue-500" />
              <StatsCard label="Total Orders" value={orders.length} icon={ShoppingCart} color="bg-purple-500" />
              <StatsCard label="Categories" value={categories.length} icon={Tag} color="bg-orange-500" />
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-display font-black mb-6">Recent Orders</h3>
              <OrdersTable orders={orders.slice(0, 5)} onUpdateStatus={loadData} />
            </div>
          </div>
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
              onDelete={async (id) => {
                if (confirm('Are you sure?')) {
                  await adminService.deleteProduct(id);
                  loadData();
                }
              }}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <OrdersTable orders={orders} onUpdateStatus={loadData} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all shadow-sm hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <CategoryIcon name={cat.icon} size={24} />
                  </div>
                  <div>
                    <span className="block font-bold text-accent-deep">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{cat.id}</span>
                  </div>
                </div>
                <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            ))}
            <button className="border-2 border-dashed border-gray-200 p-6 rounded-3xl flex items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-all bg-white/50 hover:bg-white group">
              <Plus size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold">Add Category</span>
            </button>
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
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm group",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:bg-surface hover:text-primary"
      )}
    >
      <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-primary")} />
      <span className="hidden md:block">{label}</span>
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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
      <thead className="bg-surface border-b border-gray-50">
        <tr>
          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Product</th>
          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Price</th>
          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {products.map((p: Product) => (
          <tr key={p.id} className="hover:bg-surface/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative">
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
                    <ImageIcon size={20} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <span className="block font-bold text-accent-deep text-sm line-clamp-1">{p.name}</span>
                  {p.size && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {p.size} {p.unit || 'pcs'}
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="bg-surface px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase">{getCategoryName(p.category)}</span>
            </td>
            <td className="px-6 py-4 font-bold text-sm">৳{p.price}</td>
            <td className="px-6 py-4">
              {p.isFlashSale ? (
                <span className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                  <Clock size={12} /> FLASH
                </span>
              ) : (
                <span className="text-gray-400 font-medium text-[10px]">Regular</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => onEdit(p)}
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(p.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

function OrdersTable({ orders, onUpdateStatus }: any) {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-gray-50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((o: any) => {
            const Icon = getStatusIcon(o.status);
            return (
              <tr key={o.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-primary font-bold">#{o.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-accent-deep">{o.customer.name}</div>
                  <div className="text-[10px] text-gray-400">{o.customer.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-500">{o.items.length} items</td>
                <td className="px-6 py-4 font-bold text-sm">৳{o.total}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(o.status))}>
                    <Icon size={12} /> {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <select 
                      value={o.status}
                      onChange={async (e) => {
                        await adminService.updateOrderStatus(o.id, e.target.value);
                        onUpdateStatus();
                      }}
                      className="text-[10px] font-bold bg-surface border border-gray-100 rounded-lg p-1 outline-none focus:ring-2 focus:ring-primary/20"
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
    discount: product?.discount || 0,
    images: product?.images || [],
    unit: product?.unit || 'pcs',
    size: product?.size || 1
  });
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
              <select 
                className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
                <div key={idx} className="relative group">
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
