'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Package, 
  ShoppingCart, 
  Settings as SettingsIcon,
  Menu, 
  X, 
  Bell, 
  ChevronDown, 
  LogOut,
  ShieldCheck,
  Search
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const sidebarItems: SidebarItemProps[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/sliders', label: 'Hero Sliders', icon: ImageIcon },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white border-r border-slate-800 shrink-0">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-slate-800">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
            আ
          </div>
          <div>
            <h2 className="font-semibold text-lg tracking-tight font-display text-white">আহরোণ Admin</h2>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon size={20} className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <button 
            onClick={() => console.log('Logout action')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 transition-colors rounded-xl font-medium text-sm group"
          >
            <LogOut size={20} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-md">
              আ
            </div>
            <h2 className="font-semibold text-md font-display">আহরোণ Admin</h2>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <button
                key={item.href}
                onClick={() => {
                  setIsMobileOpen(false);
                  // Trigger programmatic route if routing is used, in pure layouts it maps via standard Link
                  window.location.href = item.href;
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 transition-colors rounded-xl font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 relative z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 w-64 md:w-80">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search resources, articles, actions..." 
                className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder-slate-400 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick action flag */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-100">
              <ShieldCheck size={14} />
              <span>Developer Workspace</span>
            </div>

            {/* Notification Bell */}
            <button className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 pr-3 rounded-xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-8.5 h-8.5 bg-slate-200 border-2 border-emerald-100 rounded-xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center font-bold text-xs text-slate-600">
                  AD
                </div>
                <div className="hidden xs:block text-left">
                  <p className="text-xs font-bold text-slate-800">Admin Account</p>
                  <p className="text-[10px] text-slate-400 font-semibold leading-none mt-0.5">reocleanproperties@gmail.com</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>

              {showProfileDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowProfileDropdown(false)} />
                  <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-2.5 border-b border-slate-50 mb-1.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logged in user</p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">reocleanproperties@gmail.com</p>
                    </div>
                    <button 
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-xs transition-colors"
                      onClick={() => console.log('Logout')}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
