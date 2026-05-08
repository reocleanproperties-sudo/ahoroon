import { motion } from 'motion/react';
import { Settings, Package, Heart, Bell, CreditCard, ChevronRight, LogOut, User } from 'lucide-react';

export default function Profile() {
  const menuItems = [
    { icon: <Package size={20} />, label: 'My Orders', desc: 'Active and past orders' },
    { icon: <Heart size={20} />, label: 'Wishlist', desc: 'Saved for later' },
    { icon: <CreditCard size={20} />, label: 'Payments', desc: 'Secure payment methods' },
    { icon: <Bell size={20} />, label: 'Notifications', desc: 'Offers and updates' },
    { icon: <Settings size={20} />, label: 'Account', desc: 'Privacy and security' },
  ];

  return (
    <div className="px-4 md:px-8 py-10 space-y-10 pb-24 lg:pb-10">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-white shadow-xl overflow-hidden">
            <User size={48} />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Alex Rivers</h1>
          <p className="text-sm font-medium text-gray-400 px-3 py-1 bg-gray-50 rounded-full w-fit">Premium Member</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Orders', val: '12' },
          { label: 'Saved', val: '45' },
          { label: 'Coupons', val: '3' },
        ].map((stat, i) => (
          <div key={`stat-${i}`} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stat.val}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300 ml-2">Personal Settings</h3>
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <motion.button
              key={`menu-${idx}`}
              whileHover={{ x: 4 }}
              className="w-full glass-card p-5 flex items-center justify-between group transition-all hover:border-primary/20"
            >
              <div className="flex items-center gap-5">
                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 font-bold group-hover:bg-primary group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="text-gray-200 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 p-5 bg-red-50 text-red-500 rounded-3xl font-bold hover:bg-red-500 hover:text-white transition-all duration-300">
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  );
}
