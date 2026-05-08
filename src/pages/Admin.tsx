import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReactToPrint } from 'react-to-print';
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

type Tab = 'dashboard' | 'products' | 'orders' | 'categories' | 'users' | 'invoices';

export default function Admin() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
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
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6">
          <div className="logo-text text-2xl hidden lg:block">আহরোণ</div>
          <div className="w-10 h-10 bg-primary rounded-xl lg:hidden flex items-center justify-center text-white">আ</div>
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
          <SidebarItem 
            icon={Users} 
            label="Users" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <SidebarItem 
            icon={ReceiptText} 
            label="Manual Invoices" 
            active={activeTab === 'invoices'} 
            onClick={() => setActiveTab('invoices')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-500 transition-colors rounded-xl font-bold text-sm"
          >
            <LogOut size={20} />
            <span className="hidden lg:block">Logout</span>
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
                <span className="hidden sm:block">Create Invoice</span>
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
              <StatsCard label="Manual Invoices" value={manualInvoices.length} icon={ReceiptText} color="bg-rose-500" />
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-display font-black mb-6">Recent Orders</h3>
              <OrdersTable orders={orders.slice(0, 5)} onUpdateStatus={loadData} onView={setViewingOrder} />
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
            <OrdersTable orders={orders} onUpdateStatus={loadData} onView={setViewingOrder} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div key={`${cat.id || 'cat'}-${idx}`} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all shadow-sm hover:shadow-lg">
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
                    onClick={async () => {
                      if (confirm(`Delete category "${cat.name}"? Products in this category will remain but their category link might break.`)) {
                        await adminService.deleteCategory(cat.id);
                        loadData();
                      }
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
              onDelete={async (id: string) => {
                if (confirm('Are you sure you want to delete this user?')) {
                  await adminService.deleteUser(id);
                  loadData();
                }
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
              onDelete={async (id: string) => {
                if (confirm('Delete this invoice?')) {
                  await adminService.deleteManualInvoice(id);
                  loadData();
                }
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
      <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-primary flex-shrink-0")} />
      <span className="hidden lg:block truncate">{label}</span>
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
        {products.map((p: Product, idx: number) => (
          <tr key={`${p.id || 'new'}-${idx}`} className="hover:bg-surface/50 transition-colors">
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
          {orders.map((o: any, idx: number) => {
            const Icon = getStatusIcon(o.status);
            return (
              <tr key={`${o.id || 'order'}-${idx}`} className="hover:bg-surface/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-primary font-bold">#{o.id ? o.id.slice(0, 8) : 'NEW'}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-accent-deep">{o.customer?.name}</div>
                  <div className="text-[10px] text-gray-400">{o.customer?.phone}</div>
                  <div className="text-[10px] text-gray-400 italic line-clamp-1">{o.customer?.address}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-500">{o.items.length} items</td>
                <td className="px-6 py-4 font-bold text-sm">৳{o.total}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(o.status))}>
                    <Icon size={12} /> {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3 items-center">
                    <button 
                      onClick={() => onView(o)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg shadow-sm border border-gray-100"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <select 
                      value={o.status}
                      onChange={async (e) => {
                        await adminService.updateOrderStatus(o.id, e.target.value);
                        onUpdateStatus();
                      }}
                      className="text-[10px] font-bold bg-surface border border-gray-100 rounded-lg p-1.5 outline-none focus:ring-2 focus:ring-primary/20"
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
        className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl p-8 relative"
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
                  key={`${iconName}-${idx}`}
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
                <div key={`${item.id || 'item'}-${idx}`} className="p-4 flex items-center gap-4 hover:bg-surface/30 transition-colors">
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
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Invoice-${order.id.slice(-8).toUpperCase()}`,
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      {/* Controls - Sticky on Mobile */}
      <div className="fixed top-0 left-0 right-0 p-4 flex flex-wrap justify-center sm:justify-end gap-2 bg-black/50 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none sm:absolute sm:top-8 sm:right-8 z-[100] print:hidden">
        <button 
          onClick={() => handlePrint()}
          className="bg-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-all active:scale-95 text-sm sm:text-base"
        >
          <Printer size={16} className="sm:w-[18px]" /> Print <span className="hidden xs:inline">Invoice</span>
        </button>
        <button 
          onClick={() => handlePrint()}
          className="bg-accent-deep text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-xl flex items-center gap-2 font-bold hover:scale-105 transition-all active:scale-95 text-sm sm:text-base"
        >
          <Download size={16} className="sm:w-[18px]" /> <span className="hidden xs:inline">Save</span> PDF
        </button>
        <button 
          onClick={onClose}
          className="bg-white/10 text-white p-2.5 sm:p-3 rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all ml-1 sm:ml-0"
        >
          <X size={20} className="sm:w-6" />
        </button>
      </div>

      <div ref={contentRef} className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 mt-20 sm:my-12 p-4 sm:p-12 shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:p-0 print:my-0 print:mt-0" id="invoice-content">
        {/* Fancy Border - Mobile Only */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-deep to-primary print:hidden" />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="space-y-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-white rotate-3 shadow-lg shadow-primary/20 shrink-0">
                <span className="text-xl sm:text-2xl font-black italic uppercase">আ</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-black text-primary italic tracking-tight uppercase leading-tight">
                আহরোণ <span className="text-accent-deep not-italic font-sans text-lg sm:text-2xl block xs:inline">(Aharon)</span>
              </h1>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              <p>Specialized in Quality Products</p>
              <div className="mt-2 space-y-1.5 text-gray-500 normal-case tracking-normal">
                <p className="flex items-start gap-2"><MapPin size={12} className="text-primary mt-0.5 shrink-0" /> Mirpur-10, Dhaka-1216, Bangladesh</p>
                <p className="flex items-start gap-2"><FileText size={12} className="text-primary mt-0.5 shrink-0" /> TIN: 123456789101 | BIN: 001234567-0101</p>
                <p className="flex items-start gap-2"><User size={12} className="text-primary mt-0.5 shrink-0" /> Support: +880 1700-000000 | reocleanproperties@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto text-left md:text-right space-y-4 pt-4 md:pt-0 border-t border-gray-100 md:border-0">
            <div className="inline-block px-4 sm:px-6 py-2 bg-accent-deep text-white font-display font-black text-lg sm:text-xl italic skew-x-[-12deg]">
              <span className="inline-block skew-x-[12deg]">INVOICE</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-start md:justify-end gap-2 text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-tighter">Invoice No:</span>
                <span className="text-accent-deep">#{ (order.invoiceNo || order.id).slice(-8).toUpperCase() }</span>
              </div>
              <div className="flex justify-start md:justify-end gap-2 text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-tighter">Date:</span>
                <span className="text-accent-deep">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-start md:justify-end gap-2 text-xs font-bold">
                <span className="text-gray-400 uppercase tracking-tighter">Order Status:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px]">{order.status?.toUpperCase() || 'PAID'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Visual Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="relative p-5 sm:p-6 bg-surface rounded-3xl border border-gray-100 overflow-hidden print:border-gray-200">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">BILLING TO</h3>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-black text-accent-deep leading-tight">{order.customerName || order.customer?.name}</p>
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                  <Phone size={14} className="text-primary/40 shrink-0" /> {order.phoneNumber || order.customer?.phone}
                </p>
                <p className="text-sm text-gray-400 font-medium leading-relaxed flex items-start gap-2">
                  <MapPin size={14} className="text-primary/40 mt-1 flex-shrink-0" /> {order.address || order.customer?.address}
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative p-5 sm:p-6 bg-accent-deep rounded-3xl overflow-hidden text-white shadow-xl shadow-accent-deep/20 print:shadow-none print:text-black print:bg-surface print:border print:border-gray-200">
            <h3 className="text-[10px] font-black text-white/40 print:text-accent-deep uppercase tracking-[0.2em] mb-4">PAYMENT DETAILS</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold opacity-60">Payment Method</span>
                <span className="font-black">{order.paymentMethod || 'Cash on Delivery'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold opacity-60">Total Items</span>
                <span className="font-black text-right">{order.items?.reduce((acc: number, item: any) => acc + (item.cartQuantity || 1), 0) || 0} Units</span>
              </div>
              <div className="pt-4 border-t border-white/10 print:border-accent-deep/10 flex justify-between items-center">
                <span className="text-xs font-bold uppercase italic tracking-widest">Grand Total</span>
                <span className="text-2xl sm:text-3xl font-display font-black tracking-tighter">৳{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Enhanced UI */}
        <div className="mb-8 sm:mb-12 overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-accent-deep text-xs">
                  <th className="px-3 py-4 text-left font-black text-accent-deep uppercase tracking-widest w-16">No</th>
                  <th className="px-3 py-4 text-left font-black text-accent-deep uppercase tracking-widest">Item Description</th>
                  <th className="px-3 py-4 text-center font-black text-accent-deep uppercase tracking-widest w-16">Qty</th>
                  <th className="px-3 py-4 text-right font-black text-accent-deep uppercase tracking-widest">Price</th>
                  <th className="px-3 py-4 text-right font-black text-accent-deep uppercase tracking-widest">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items?.map((item: any, i: number) => (
                  <tr key={`${item.id || 'inv'}-${i}`} className="text-sm group hover:bg-surface/50 transition-colors">
                    <td className="px-3 py-5 font-bold text-gray-400">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-3 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden border border-gray-50 flex-shrink-0 print:hidden">
                          <img 
                            src={item.image} 
                            className="w-full h-full object-cover" 
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Item'}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-accent-deep text-sm line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">UNIT: {item.unit || 'pcs'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-5 text-center font-black text-gray-600">
                      {item.cartQuantity || 1}
                    </td>
                    <td className="px-3 py-5 text-right font-bold text-gray-500 whitespace-nowrap">৳{item.price}</td>
                    <td className="px-3 py-5 text-right font-black text-accent-deep whitespace-nowrap">৳{item.price * (item.cartQuantity || 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-12">
          <div className="flex-1 space-y-6 w-full">
            <div className="p-5 sm:p-6 bg-surface rounded-3xl border border-dashed border-gray-200">
              <h4 className="text-[10px] font-black text-primary uppercase mb-3 px-1">Terms & Conditions</h4>
              <ul className="text-[10px] text-gray-400 font-bold space-y-1.5 list-disc pl-5 leading-relaxed">
                <li>Goods once sold are not returnable without valid reason.</li>
                <li>Please keep this invoice for any warranty claims.</li>
                <li>This is a computer-generated invoice, no signature is required.</li>
              </ul>
            </div>
            <div className="flex items-center gap-4 px-2">
              <div className="w-16 h-16 opacity-10 print:opacity-30 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-accent-deep">
                  <rect x="10" y="10" width="80" height="80" rx="10" />
                  <path d="M25 25h10v10H25zM45 25h10v10H45zM65 25h10v10H65zM25 45h10v10H25zM25 65h10v10H25z" fill="white" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-accent-deep uppercase truncate">Scan to Verify</p>
                <p className="text-[9px] text-gray-400 font-medium truncate">Valid Aharon Official Document</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
              <span>Basic Amount</span>
              <span className="text-accent-deep">৳{order.total}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-tighter">
              <span>Delivery Charge</span>
              <span className="text-emerald-500 font-black">FREE</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-tighter border-b border-gray-100 pb-4">
              <span>Discount</span>
              <span className="text-rose-500">৳0</span>
            </div>
            <div className="flex justify-between items-center p-5 sm:p-6 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 print:bg-white print:text-black print:border-2 print:border-accent-deep print:shadow-none">
              <span className="font-display font-black text-lg sm:text-xl uppercase italic tracking-widest">NET TOTAL</span>
              <span className="text-2xl sm:text-3xl font-display font-black tracking-tighter">৳{order.total}</span>
            </div>
            
            <div className="pt-10 sm:pt-12 text-center">
              <div className="w-32 sm:w-40 h-0.5 bg-gray-100 mx-auto mb-2" />
              <p className="text-[10px] font-black text-gray-400 uppercase">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 sm:mt-16 py-4 border-t border-gray-50 text-center flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Official Invoice &copy; {new Date().getFullYear()} Aharon Shopping | MIRPUR DHAKA</p>
          <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">A product of reocleanproperties@gmail.com</p>
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
    discount: product?.discount || 0,
    images: product?.images || [],
    unit: product?.unit || 'pcs',
    size: product?.size || 1,
    moq: product?.moq || 1,
    step: product?.step || 1
  });
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

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
                  <option key={`${c.id || 'opt'}-${idx}`} value={c.id}>{c.name}</option>
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
                <div key={`gallery-${idx}`} className="relative group">
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
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-gray-50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Role</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Permissions</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((u: any, idx: number) => (
            <tr key={`${u.id || 'user'}-${idx}`} className="hover:bg-surface/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-accent-deep">{u.name || 'No Name'}</p>
                    <p className="text-[10px] text-gray-400">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 lowercase">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold",
                  u.role === 'admin' ? "bg-red-50 text-red-500" : 
                  u.role === 'editor' ? "bg-blue-50 text-blue-500" : "bg-gray-50 text-gray-400"
                )}>
                  {u.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {(u.permissions || []).map((p: string, i: number) => (
                    <span key={i} className="text-[8px] bg-surface px-1.5 py-0.5 rounded border border-gray-100 text-gray-400 font-bold uppercase">
                      {p}
                    </span>
                  ))}
                  {(!u.permissions || u.permissions.length === 0) && <span className="text-[10px] text-gray-300">None</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(u)} className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => onDelete(u.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoicesTable({ invoices, onView, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-surface border-b border-gray-50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Invoice No</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoices.map((inv: any, idx: number) => (
            <tr key={`${inv.id || 'inv'}-${idx}`} className="hover:bg-surface/50 transition-colors">
              <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{inv.invoiceNo}</td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-accent-deep">{inv.customer?.name}</div>
                <div className="text-[10px] text-gray-400">{inv.customer?.phone}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                {inv.items?.length || 0} items
              </td>
              <td className="px-6 py-4 font-bold text-sm">৳{inv.total}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onView(inv)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-white rounded-lg border border-gray-100 shadow-sm"><Printer size={18} /></button>
                  <button onClick={() => onDelete(inv.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
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
      if (user?.id) {
        await adminService.updateUser(user.id, formData);
      } else {
        await adminService.addUser(formData as any);
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
        className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl p-8 relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-display font-black text-accent-deep mb-8">
          {user?.id ? 'Edit User' : 'Add New User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
            <input 
              required
              type="email" 
              className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
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
              {allPermissions.map(p => (
                <button
                  key={p}
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

function ManualInvoiceModal({ invoice, onClose, onSave }: any) {
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
    status: invoice?.status || 'Paid'
  });
  const [loading, setLoading] = useState(false);

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

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <ReceiptText /> {invoice?.id ? 'Edit Manual Invoice' : 'Create Manual Invoice'}
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
              {formData.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end bg-gray-50 p-4 rounded-2xl group transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
                    <input 
                      required
                      placeholder="e.g. Sauf/Mouri"
                      className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm"
                      value={item.name}
                      onChange={e => updateItem(idx, 'name', e.target.value)}
                    />
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
                      className="w-full bg-white p-3 rounded-xl border border-gray-100 text-sm font-bold"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(idx)}
                    disabled={formData.items.length === 1}
                    className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-accent-deep rounded-3xl text-white">
            <div className="space-y-4 w-full md:w-auto">
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Payment Method</label>
                <input 
                  className="bg-white/10 border border-white/20 rounded-xl p-3 text-sm focus:bg-white/20 outline-none w-full"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                />
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
              <><Save size={24} /> {invoice?.id ? 'Update Invoice' : 'Create & Save Invoice'}</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
