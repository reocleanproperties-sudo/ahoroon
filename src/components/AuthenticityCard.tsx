import React from 'react';
import { MapPin, ShieldCheck, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthenticityCardProps {
  origin?: string;
  labTestUrl?: string;
  harvestDate?: string;
  isVerified?: boolean;
}

export const AuthenticityCard: React.FC<AuthenticityCardProps> = ({
  origin = "সুন্দরবন, সাতক্ষীরা",
  labTestUrl = "#",
  harvestDate = "১০ মার্চ, ২০২৪",
  isVerified = true
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-6 md:p-8 space-y-8 relative overflow-hidden"
    >
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-display font-medium">Authenticity Dashboard</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Transparency & Trust</p>
        </div>
        {isVerified && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Ahoroon Verified</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Origin */}
        <div className="flex gap-4 items-start group">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Origin Details</p>
            <p className="font-bold text-accent-deep">{origin}</p>
            <p className="text-[10px] text-primary/60 font-medium">Direct Sourcing</p>
          </div>
        </div>

        {/* Harvest Date */}
        <div className="flex gap-4 items-start group">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Date of Collection</p>
            <p className="font-bold text-accent-deep">{harvestDate}</p>
            <p className="text-[10px] text-primary/60 font-medium">Fresh Harvest</p>
          </div>
        </div>

        {/* Lab Test */}
        <div className="flex gap-4 items-start group">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
            <FileText size={22} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">Purity Certification</p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-accent-deep">BSTI & Lab Tested</p>
            </div>
            <a href={labTestUrl} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 mt-0.5">
              View Certificate <span className="text-[8px]">→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-primary/5">
        <div className="bg-primary/5 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed italic">
            This product has passed our <span className="font-bold text-accent-deep">7-Point Purity Check</span> and is directly sourced from the verified artisan mentioned above.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
