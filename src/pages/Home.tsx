import { PRODUCTS, CATEGORIES } from '../data';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Clock, ShieldCheck, Truck, Award, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Home() {
  const flashSaleProducts = PRODUCTS.filter(p => p.isFlashSale);

  return (
    <div className="space-y-12 pb-24 overflow-x-hidden">
      {/* Hero Banner (Reverted to previous style) */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pt-6">
        <div className="relative h-64 md:h-[450px] rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-primary/10">
          <img 
            src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&q=80" 
            alt="Traditional Bengali Food" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center p-8 md:p-16 text-white">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-fit bg-primary/20 backdrop-blur-md border border-white/20 px-4 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              গ্রাম বাংলার আসল স্বাদ
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-6xl font-display font-bold text-white leading-tight mb-4"
            >
              বাংলার ঐতিহ্য, <br/>
              <span className="text-primary italic">খাঁটি স্বাদে</span> ফিরে আসুক
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-200 text-[10px] md:text-base max-w-md leading-relaxed mb-6 line-clamp-2 md:line-clamp-none"
            >
              আহরোণ—গত ৭ বছর ধরে গ্রাম থেকে শহরে পৌঁছে দিচ্ছি খাঁটি ও আসল স্বাদের খাবার।
            </motion.p>
            <div className="flex gap-4">
              <Link 
                to="/category/all" 
                className="bg-primary text-white px-8 py-3 rounded-full text-xs md:text-sm font-bold hover:bg-white hover:text-primary transition-all shadow-xl"
              >
                Order করুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Us (Mission) */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center pt-8">
        <div className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-accent-deep">আহরোণ সম্পর্কে</h2>
          <p className="text-gray-600 leading-relaxed">
            আহরোণ শুধুমাত্র একটি ব্যবসা নয়—এটি একটি মিশন। আমরা বিশ্বাস করি, বাংলার প্রতিটি ঐতিহ্যবাহী খাবারের পেছনে রয়েছে ইতিহাস, সংস্কৃতি এবং মানুষের গল্প। গত ৭ বছর ধরে আমরা দেশের বিভিন্ন অঞ্চল ঘুরে খুঁজে বের করছি আসল উৎপাদকদের।
          </p>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: ShieldCheck, title: "১০০% ভেজালমুক্ত", desc: "আমরা সর্বোচ্চ মানের নিশ্চয়তা দিই।" },
              { icon: Truck, title: "সরাসরি সোর্সিং", desc: "উৎপাদকের কাছ থেকে সরাসরি সংগ্রহ করা হয়।" },
              { icon: Award, title: "ঐতিহ্য রক্ষা", desc: "গ্রামীণ উদ্যোক্তাদের সাপোর্ট করি।" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-surface rounded-2xl border border-gray-100">
                <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-accent-deep">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80" 
            alt="Authentic Sourcing" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
            <p className="text-primary font-bold text-xl leading-tight">৭ বছরের অভিজ্ঞতা</p>
            <p className="text-gray-500 text-xs">আপনার আস্থার প্রতীক</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-primary font-bold text-xs uppercase tracking-widest">আমাদের পণ্যসমূহ</p>
            <h2 className="text-3xl font-display font-bold">বিভাগ অনুযায়ী খুঁজুন</h2>
          </div>
          <Link to="/categories" className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            See All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="flex flex-col items-center gap-3 min-w-[100px] group"
            >
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 bg-white border border-gray-100 group-hover:bg-primary group-hover:border-primary group-hover:shadow-xl shadow-primary/20 group-hover:-translate-y-1">
                <div className="text-gray-400 group-hover:text-white transition-colors text-xl font-bold">
                  {cat.name.charAt(0)}
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">আপনার জন্য সেরা পণ্য</h2>
          <Link to="/category/all" className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-500">
            <ArrowRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-accent-deep py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">কেন আহরোণ বেছে নেবেন?</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "৭ বছরের অভিজ্ঞতা", val: "Experience" },
              { label: "ভেজালমুক্ত নিশ্চয়তা", val: "Pure" },
              { label: "সারাদেশে ডেলিভারি", val: "Delivery" },
              { label: "পাবলিক ট্রাস্ট", val: "Trust" }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-white font-bold text-lg">{item.label}</p>
                <div className="text-primary/60 text-xs font-mono uppercase tracking-widest">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 md:px-8 max-w-4xl mx-auto py-12 text-center space-y-8">
        <Quote className="mx-auto text-primary opacity-20" size={60} />
        <p className="text-xl md:text-2xl font-medium text-gray-700 italic leading-relaxed">
          “আহরোণ থেকে কেনা শুটকি একদম গ্রামের মতো খাঁটি—এখন আর বাইরে খুঁজতে হয় না। তাদের পণ্য মানেই আস্থার ঠিকানা।”
        </p>
        <div className="space-y-1">
          <p className="font-bold text-accent-deep">সন্তুষ্ট গ্রাহক</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest">ভেরিফাইড পারচেজ</p>
        </div>
      </section>
    </div>
  );
}

