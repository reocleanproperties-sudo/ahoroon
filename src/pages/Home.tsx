import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES } from '../data';
import { ProductCard } from '../components/ProductCard';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  Star, 
  Users, 
  Sparkles, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  Award,
  Newspaper,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { storeService } from '../services/storeService';
import { adminService } from '../services/adminService';
import { Product, Category, SliderImage, Producer, PressCoverage } from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import { RecommendedProducts } from '../components/RecommendedProducts';

const FALLBACK_PRODUCERS: Producer[] = [
  {
    id: 'prod-1',
    name: "আব্দুল মজিদ",
    role: "মধু সংগ্রহকারী, সুন্দরবন",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
    story: "৩ পুরুষ ধরে তারা সুন্দরবনের খাঁটি মধু সংগ্রহ করেন। তার পরম শ্রদ্ধায় সংগৃহীত আসল মধু পৌঁছে যায় আপনার দোরগোড়ায়।",
    order: 1
  },
  {
    id: 'prod-2',
    name: "রাবেয়া বেগম",
    role: "হাতে তৈরি ঘি কারিগর, পাবনা",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    story: "ঐতিহ্যবাহী গাওয়া পদ্ধতিতে নিজস্ব গাভীর খাঁটি দুধ হতে সর বানিয়ে ঘি প্রস্তুত করেন। কোনো রাসায়নিক ও প্রিজারভেটিভ নেই।",
    order: 2
  },
  {
    id: 'prod-3',
    name: "করিম চাচা",
    role: "সরিষা চাষী, মানিকগঞ্জ",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    story: "নিজে খাঁটি সরিষা বুনে ঘানি ভেঙে প্রাকৃতিক তেল নিষ্কাশন করেন। যে তেলের উগ্র ঝাঁঝ ও সেন্ট রান্নায় এনে দেয় আভিজাত্যের স্পর্শ।",
    order: 3
  }
];

const FALLBACK_SLIDERS: SliderImage[] = [
  {
    id: 'slider-1',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&q=80',
    title: 'মাটির সোঁদা গন্ধে, মমতার স্পর্শে',
    description: 'গ্রামের কৃষকের ঘাম আর কারিগরের মমতা মাখা খাঁটি পণ্য এখন সরাসরি আপনার দোরগোড়ায়।',
    link: '/category/all',
    order: 1,
  },
  {
    id: 'slider-2',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80',
    title: 'ঐতিহ্যবাহী খাঁটি মশলা',
    description: 'বিখ্যাত চট্টগ্রামের মেজবানি রান্নার আসল স্বাদ পেতে আমাদের স্পেশাল গোপন মশলা।',
    link: '/category/spices',
    order: 2,
  },
  {
    id: 'slider-3',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e783137?w=1600&q=80',
    title: 'সুন্দরবনের খাঁটি মধু',
    description: 'রাঙ্গামাটির গভীর জঙ্গল ও সুন্দরবন থেকে সংগৃহীত খাঁটি মধু, শতভাগ কৃত্রিম উপাদানমুক্ত।',
    link: '/category/hilly',
    order: 3,
  },
  {
    id: 'slider-4',
    imageUrl: 'https://images.unsplash.com/photo-1626132646529-5003375a954e?w=1600&q=80',
    title: 'উপকূলের তাজা শুঁটকি',
    description: 'প্রাকৃতিকভাবে শুকানো, কোনো রাসায়নিক ছাড়া তৈরি আসল স্বাদের লইট্টা ও ছুরি শুঁটকি।',
    link: '/category/shukti',
    order: 4,
  },
  {
    id: 'slider-5',
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=1600&q=80',
    title: 'জৈব ও প্রাকৃতিক চাষাবাদ',
    description: 'আমাদের সকল পণ্য সম্পূর্ণ প্রাকৃতিক উপায়ে উৎপাদিত ও পরম যত্নে সংগৃহীত।',
    link: '/category/all',
    order: 5,
  },
  {
    id: 'slider-6',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1600&q=80',
    title: 'পাবনার গাওয়া ঘি ও দুগ্ধজাত পণ্য',
    description: 'ঐতিহ্যবাহী পদ্ধতিতে তৈরি খাঁটি ঘি আপনার খাবারে যোগ করবে অতুলনীয় আভিজাত্য।',
    link: '/category/tradition',
    order: 6,
  },
  {
    id: 'slider-7',
    imageUrl: 'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?w=1600&q=80',
    title: 'মানিকগঞ্জের ঘানি-ভাঙা সরিষার তেল',
    description: 'নিজে ঘানি টেনে বের করা খাঁটি তেলের তীব্র ঝাঁঝ ও মনমাতানো সরিষার সুবাস।',
    link: '/category/spices',
    order: 7,
  },
  {
    id: 'slider-8',
    imageUrl: 'https://images.unsplash.com/photo-1608697138356-dfc0032cc629?w=1600&q=80',
    title: 'বাংলার ঐতিহ্যবাহী কারুশিল্প',
    description: 'মমতা ও ঐতিহ্যের ছোঁয়ায় তৈরি খাঁটি দেশীয় মাটির ও বাঁশের তৈজসপত্র ও সাজসজ্জা।',
    link: '/category/all',
    order: 8,
  }
];

const FALLBACK_PRESS: PressCoverage[] = [
  {
    id: 'press-1',
    source: "প্রথম আলো",
    title: "খাদ্য ভেজালের ভিড়ে এক অনন্য আস্থার নাম ‘আহরোণ’",
    excerpt: "সুন্দরবনের গহীন জঙ্গল থেকে শুরু করে পাবনার দুগ্ধ খামার—সব জায়গায় নিজেদের প্রতিনিধির মাধ্যমে শতভাগ খাঁটি ও ভেজালমুক্ত ঐতিহ্যবাহী খাদ্যপণ্য শহরের মানুষের দুয়ারে পৌঁছে দিচ্ছে আহরোণ।",
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    link: "https://www.prothomalo.com",
    date: "জানুয়ারি ১৫, ২০২৬",
    order: 1
  },
  {
    id: 'press-2',
    source: "দ্য ডেইলি স্টার",
    title: "Ahoron: Pure ingredients straight from local farms",
    excerpt: "By weeding out middle-men and verifying purity at origin, start-up Ahoron is empowering grassroot level honey hunters, ghee masters, and mustard farmers across Bangladesh with fair value.",
    img: "https://images.unsplash.com/photo-1546422904-90eabf3bac0a?w=800&q=80",
    link: "https://www.thedailystar.net",
    date: "মার্চ ০৫, ২০২৬",
    order: 2
  },
  {
    id: 'press-3',
    source: "কালের কণ্ঠ",
    title: "সরিষা ও মধুর আসল স্বাদ ফিরিয়ে আনছে তরুণেরা",
    excerpt: "নিজস্ব তত্ত্বাবধানে ঘানিভাঙা তেল আর সুন্দরবনের প্রাকৃতিক মধুর অসাধারণ স্বাদ নিয়ে ক্রেতাদের আস্থার জায়গা হয়ে উঠেছে এই উদ্যোগ। তাদের গুনগত মান রক্ষা এবং কারিগরবান্ধব পলিসি সত্যিই অতুলনীয়।",
    img: "https://images.unsplash.com/photo-1588681664899-f142ff2af9b3?w=800&q=80",
    link: "https://www.kalerkantho.com",
    date: "এপ্রিল ২০, ২০২৬",
    order: 3
  }
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [sliders, setSliders] = useState<SliderImage[]>(FALLBACK_SLIDERS);
  const [producers, setProducers] = useState<Producer[]>(FALLBACK_PRODUCERS);
  const [press, setPress] = useState<PressCoverage[]>(FALLBACK_PRESS);
  const [loading, setLoading] = useState(true);
  
  // Carousel States
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [p, c, s, pr, ps] = await Promise.all([
          storeService.getProducts(),
          storeService.getCategories(),
          adminService.getSliders().catch(() => []),
          adminService.getProducers().catch(() => []),
          adminService.getPress().catch(() => [])
        ]);
        
        if (p && p.length > 0) setProducts(p);
        if (c && c.length > 0) setCategories(c);
        if (s && s.length > 0) {
          setSliders(s);
        } else {
          setSliders(FALLBACK_SLIDERS);
        }
        if (pr && pr.length > 0) {
          setProducers(pr);
        } else {
          setProducers(FALLBACK_PRODUCERS);
        }
        if (ps && ps.length > 0) {
          setPress(ps);
        } else {
          setPress(FALLBACK_PRESS);
        }
      } catch (e) {
        console.error('Error fetching home data:', e);
        setSliders(FALLBACK_SLIDERS);
        setProducers(FALLBACK_PRODUCERS);
        setPress(FALLBACK_PRESS);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Hero Slider AutoPlay Logic
  useEffect(() => {
    if (sliders.length === 0 || isCarouselHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliders.length);
    }, 5500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [sliders, isCarouselHovered]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % sliders.length);
  };

  // Derive custom featured and popular indicators with clean UI fallbacks
  const featuredProducts = products.filter(p => p.isFeatured === true);
  const activeFeatured = featuredProducts.length > 0 
    ? featuredProducts 
    : products.filter((_, idx) => idx === 0 || idx === 2 || idx === 4);

  const popularProducts = products.filter(p => p.isPopular === true);
  const activePopular = popularProducts.length > 0 
    ? popularProducts 
    : products.filter((_, idx) => idx === 1 || idx === 3 || idx === 2);

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden pt-4 bg-slate-50/50">
      
      {/* Hero Action Carousel Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto select-none">
        <div 
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          className="relative w-full aspect-[16/9] xs:aspect-[2/1] md:aspect-[2.39/1] lg:h-[580px] xl:h-[620px] rounded-[1.25rem] sm:rounded-[2rem] md:rounded-[3.5rem] overflow-hidden group shadow-2xl bg-slate-900 border border-slate-100"
        >
          {/* Transition wrapper */}
          <AnimatePresence mode="wait">
            {sliders.map((slide, index) => {
              if (index !== activeSlide) return null;
              
              const hasContent = slide.title && slide.title.trim().length > 0;
              
              return (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Backdrop Cover Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-[2]" />
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title || "আহরোণ ক্যাম্পেইন"} 
                    className="w-full h-full object-cover brightness-100 object-center"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&q=80';
                    }}
                  />

                  {/* Text Overlay - Only render if title is provided */}
                  {hasContent && (
                    <div className="absolute inset-0 z-[3] flex flex-col justify-end p-4 xs:p-6 sm:p-10 md:p-16 lg:p-20 text-white max-w-4xl">
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="w-fit bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 md:px-4 md:py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1.5 sm:mb-3 md:mb-5 flex items-center gap-1.5"
                      >
                        <Sparkles size={10} className="text-emerald-400" />
                        <span>আহরোণ প্রিমিয়াম ক্যাম্পেইন</span>
                      </motion.div>

                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="text-base xs:text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-black text-white leading-[1.25] md:leading-[1.15] mb-1 sm:mb-3 md:mb-5 tracking-tight font-sans drop-shadow-md"
                      >
                        {slide.title}
                      </motion.h2>

                      {slide.description && (
                        <motion.p
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="text-white/85 text-[9px] xs:text-[11px] sm:text-xs md:text-base max-w-xl leading-relaxed mb-2.5 sm:mb-5 md:mb-8 font-light line-clamp-1 xs:line-clamp-2 md:line-clamp-none"
                        >
                          {slide.description}
                        </motion.p>
                      )}

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="flex flex-wrap gap-2"
                      >
                        <Link 
                          to={slide.link || '/category/all'} 
                          className="bg-emerald-500 text-white px-3.5 py-1.5 sm:px-6 sm:py-3.5 rounded-lg sm:rounded-2xl font-bold text-[9px] sm:text-xs md:text-sm hover:bg-white hover:text-emerald-600 transition-all shadow-xl shadow-emerald-500/10 flex items-center gap-1 sm:gap-2 active:scale-95"
                        >
                          আসল স্বাদ দেখুন
                          <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Left Arrow */}
          <button 
            onClick={handlePrevSlide}
            className="hidden md:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-[5] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 border border-white/15"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow */}
          <button 
            onClick={handleNextSlide}
            className="hidden md:flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-[5] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 border border-white/15"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:gap-2.5 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10">
            {sliders.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                onClick={() => setActiveSlide(idx)}
                className={cn(
                  "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
                  activeSlide === idx 
                    ? "bg-emerald-400 w-4 sm:w-6" 
                    : "bg-white/50 hover:bg-white"
                )}
              />
            ))}
          </div>

          {/* Progress bar ticker */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-[5]">
            <motion.div 
              key={`bar-${activeSlide}`}
              initial={{ width: '0%' }}
              animate={{ width: isCarouselHovered ? '0%' : '100%' }}
              transition={{ duration: 5.5, ease: 'linear' }}
              className="h-full bg-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section - Minimalist / Luxury */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-100 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest.">
              <Sparkles size={14} className="text-emerald-500 animate-pulse" />
              <span>Premium Select</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">বিশেষভাবে নির্বাচিত পণ্যসমূহ</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">নিখাদ আন্তরিকতায় উৎপাদিত শতভাগ খাঁটি ও সেরা মানের উপাদানগুলির সংগ্রহ।</p>
          </div>
          <Link 
            to="/category/all" 
            className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>সব পণ্য দেখন</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={`shim-${idx}`} className="animate-pulse space-y-3">
                <div className="aspect-square bg-slate-200 rounded-3xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-5 bg-slate-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {activeFeatured.map((prod) => (
              <ProductCard key={`featured-${prod.id}`} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* Meet the Producer - Emotional Connection */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="bg-amber-100 text-amber-800 font-semibold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-amber-200 inline-block mb-1">Meet the Producers</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900">যাদের হাতে গড়া আমাদের অমূল্য সম্পদ</h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-light">
            আমরা সরাসরি কাজ করি দেশের প্রত্যন্ত অঞ্চলের কৃষক ও কারিগরদের সাথে। তাদের সততা আর ভালোবাসাই আমাদের মূল শক্তি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {producers.map((producer, idx) => (
            <motion.div
              key={producer.id || `producer-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[380px] rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100"
            >
              <img 
                src={producer.img} 
                alt={producer.name} 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-8 flex flex-col justify-end text-white z-10 transition-colors duration-500">
                <p className="text-amber-300 font-bold text-xs uppercase tracking-widest mb-1.5">{producer.role}</p>
                <h3 className="text-xl font-bold mb-3 text-[#6fde03]">{producer.name}</h3>
                <p className="text-white/80 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                  {producer.story}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Most Popular Products Section - Elegant Frame Display */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-100 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest">
              <TrendingUp size={14} className="text-amber-500" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">সবচেয়ে জনপ্রিয় পছন্দসমূহ</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">সহস্রাধিক পরিবারের আস্থার প্রথম পছন্দ এবং পুনঃক্রয় তালিকায় শীর্ষে থাকা সেরা পণ্যসমূহ।</p>
          </div>
          <Link 
            to="/category/all" 
            className="bg-slate-150 text-slate-800 border border-slate-200 rounded-xl px-5 py-2.5 hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-2 active:scale-95"
          >
            <span>অন্যান্য জনপ্রিয় আইটেম</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3].map(idx => (
              <div key={`pop-shim-${idx}`} className="animate-pulse space-y-3">
                <div className="aspect-square bg-slate-200 rounded-3xl" />
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-5 bg-slate-200 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
            {activePopular.map((prod) => (
              <div 
                key={`pop-${prod.id}`}
                className="group relative bg-white border border-slate-100 rounded-3xl p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <Link to={`/product/${prod.id}`} className="block select-none space-y-4">
                  {/* Photo area */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase flex items-center gap-1 border border-white/10 shadow-sm">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{prod.rating} Rating</span>
                    </div>
                  </div>

                  {/* Metadata descriptive and reviews */}
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-1 group-hover:text-emerald-500 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </Link>

                <div className="pt-4 border-t border-slate-50 mt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-400 font-medium">মূল্য</p>
                    <p className="text-md md:text-lg font-black text-slate-800">৳{prod.price}</p>
                  </div>
                  <Link 
                    to={`/product/${prod.id}`}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white px-4.5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>সংগ্রহ করুন</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Smart Recommendations */}
      <RecommendedProducts />

      {/* Newspaper Coverage Section - Brand Trust & Story */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-100 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <Newspaper size={14} className="text-emerald-500" />
              <span>Ahoron in the Press</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">সংবাদপত্রের পাতায় ‘আহরোণ’</h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">দেশের শীর্ষস্থানীয় গণমাধ্যমে আমাদের খাঁটি পণ্যের উদ্যোগ ও কারিগরদের জীবন নিয়ে প্রকাশিত কিছু প্রতিবেদন।</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {press.map((item, idx) => (
            <motion.div
              key={item.id || `press-${idx}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* News Thumbnail Container */}
                <div className="aspect-[16/10] overflow-hidden bg-slate-50 relative border-b border-slate-100">
                  <img 
                    src={item.img} 
                    alt={item.source} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-emerald-500/90 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                    {item.source}
                  </div>
                </div>

                {/* Text Content */}
                <div className="px-6 pb-6 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold block">{item.date}</span>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              {item.link && item.link !== '#' && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-50/50">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <span>मूल खबरটি পড়ুন</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof Badges with Minimalist Icons */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 select-none">
        {[
          { icon: ShieldCheck, title: "১০০% খাঁটি ও বিশুদ্ধ", desc: "ল্যাব সার্টিফাইড পণ্য" },
          { icon: Heart, title: "প্রাকৃতিক সোর্সিং", desc: "সরাসরি গ্রাম থেকে" },
          { icon: Users, title: "সেরা গ্রাহক মূল্যায়ন", desc: "হাজারো পরিবারের বিশ্বাস" },
          { icon: Award, title: "প্রিমিয়াম প্যাকেটজাত", desc: "অক্ষুণ্ণ পুষ্টিগুণ মান" }
        ].map((item, i) => (
          <div key={`trust-${i}`} className="bg-white border border-slate-100 p-6.5 rounded-3xl flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
              <item.icon size={26} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Categories Carousel Grid */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-4xl font-display font-black text-slate-900">ঐতিহ্যবাহী স্বাদের সমাহার</h2>
            <p className="text-slate-400 font-serif italic text-xs md:text-sm">The soul of legendary Bengal in every single jar...</p>
          </div>
          <Link to="/categories" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs uppercase tracking-widest font-bold px-5 py-3 rounded-xl border border-slate-200/50 transition-colors">
            সব ক্যাটাগরি
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.slice(0, 5).map((cat, idx) => (
            <Link
              key={`home-cat-${cat.id || 'cat'}-${idx}`}
              to={`/category/${cat.id}`}
              className="flex flex-col items-center gap-3.5 group"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 bg-white border border-slate-100 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:shadow-xl group-hover:shadow-emerald-500/20 group-hover:-translate-y-1">
                <div className="text-emerald-600 group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
                  <CategoryIcon name={cat.icon} size={36} strokeWidth={1.5} />
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-black group-hover:text-emerald-600 transition-colors text-center font-mono">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


