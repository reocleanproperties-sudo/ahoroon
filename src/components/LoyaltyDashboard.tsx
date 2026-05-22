import React from 'react';
import { Leaf, Users, Gift, Share2, Award, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const LoyaltyDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Ahoroon Family Header */}
      <div className="glass-card p-8 bg-linear-to-br from-primary/10 via-white/50 to-secondary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Leaf size={18} />
              </div>
              <h2 className="text-3xl font-display font-medium">Ahoroon Family</h2>
            </div>
            <p className="text-gray-600 max-w-md font-medium text-sm">
              Join our mission to support local farmers. Earn <span className="text-primary font-bold">Green Badges</span> for every organic purchase.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Growth</p>
              <p className="text-2xl font-black text-primary">০২ Badges</p>
            </div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-secondary">
              <Award size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Refer a Friend Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-2 border-primary/5 hover:border-primary/20 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold">Refer a Friend</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              আপনার বন্ধুদের ইনভাইট করুন। তারা প্রথম অর্ডারে পাবেন <span className="text-primary font-bold">৳৫০ অফ</span>, আর আপনি পাবেন ১টি <span className="text-primary font-bold">Green Badge</span>!
            </p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value="AHOROON50-REF" 
                className="flex-1 bg-surface border border-gray-100 rounded-xl px-4 py-3 text-xs font-mono font-bold text-gray-500"
              />
              <button className="bg-primary text-white p-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-2 border-secondary/5 hover:border-secondary/20 transition-all group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500">
              <Gift size={24} />
            </div>
            <h3 className="text-xl font-bold">New Harvest Alerts</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              সরাসরি <span className="text-green-600 font-bold">WhatsApp</span>-এ নতুন ফসলের সমাচার পান এবং ফ্যামিলি মেম্বার হিসেবে স্পেশাল ডিসকাউন্ট উপভোগ করুন।
            </p>
            <button className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-all">
              Join WhatsApp Family
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
