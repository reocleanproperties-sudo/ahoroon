import { motion } from 'motion/react';
import { Newspaper } from 'lucide-react';

export function AharonVideoSection() {
  return (
    <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-10 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-100 pb-6 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
            <Newspaper size={14} className="text-emerald-500" />
            <span>Aharon in the Spotlight</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">সোশ্যাল মিডিয়ায় আহরোণ</h2>
          <p className="text-slate-400 text-xs md:text-sm font-medium">আমাদের যাত্রা এবং অর্জন নিয়ে সোশ্যাল মিডিয়া ও নিউজ চ্যানেলের বিশেষ প্রতিবেদন</p>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border-4 border-white ring-1 ring-slate-100"
      >
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/IwzzVbuxav0"
          title="Aharon News Feature"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </motion.div>
    </section>
  );
}
