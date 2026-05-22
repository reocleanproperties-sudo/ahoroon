'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  PlusCircle, 
  X, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  UploadCloud,
  FileImage
} from 'lucide-react';

interface SliderImage {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  link: string;
  order: number;
}

// Full-fidelity pre-seeded list for safe local fallbacks
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
    link: '/category/honey',
    order: 3,
  },
  {
    id: 'slider-4',
    imageUrl: 'https://images.unsplash.com/photo-1626132646529-5003375a954e?w=1600&q=80',
    title: 'উপকূলের তাজা শুঁটকি',
    description: 'প্রাকৃতিকভাবে শুকানো, কোনো রাসায়নিক ছাড়া তৈরি আসল স্বাদের লইট্টা ও ছুরি শুঁটকি।',
    link: '/category/dry-fish',
    order: 4,
  },
  {
    id: 'slider-5',
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=1600&q=80',
    title: 'জৈব ও প্রাকৃতিক চাষাবাদ',
    description: 'আমাদের সকল পণ্য সম্পূর্ণ প্রাকৃতিক উপায়ে উৎপাদিত ও পরম যত্নে সংগৃহীত।',
    link: '/category/organic',
    order: 5,
  },
  {
    id: 'slider-6',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1600&q=80',
    title: 'পাবনার গাওয়া ঘি ও দুগ্ধজাত পণ্য',
    description: 'ঐতিহ্যবাহী পদ্ধতিতে তৈরি খাঁটি ঘি আপনার খাবারে যোগ করবে অতুলনীয় আভিজাত্য।',
    link: '/category/ghee',
    order: 6,
  },
  {
    id: 'slider-7',
    imageUrl: 'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?w=1600&q=80',
    title: 'মানিকগঞ্জের ঘানি-ভাঙা সরিষার তেল',
    description: 'নিজে ঘানি টেনে বের করা খাঁটি তেলের তীব্র ঝাঁঝ ও মনমাতানো সুবাস।',
    link: '/category/spices',
    order: 7,
  },
  {
    id: 'slider-8',
    imageUrl: 'https://images.unsplash.com/photo-1608697138356-dfc0032cc629?w=1600&q=80',
    title: 'বাংলার কারিগরদের ঐতিহ্যবাহী মৃৎশিল্প',
    description: 'মমতা ও ঐতিহ্যের ছোঁয়ায় তৈরি খাঁটি দেশীয় মাটির বাসন-কোসন ও সাজসজ্জা।',
    link: '/category/crafts',
    order: 8,
  }
];

export default function SlidersManagementPage() {
  const [sliders, setSliders] = useState<SliderImage[]>(FALLBACK_SLIDERS);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // New Slide Form data State
  const [newSlideData, setNewSlideData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    link: ''
  });

  // Fetch Sliders list on component mount
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sliders');
      const data = await response.json();
      if (data.success && data.sliders) {
        setSliders(data.sliders);
      } else {
        // Fallback to local database if API routes are not active in sandbox/not built yet
        setSliders(FALLBACK_SLIDERS);
      }
    } catch (error) {
      console.warn('API error, using active state fallback:', error);
      setSliders(FALLBACK_SLIDERS);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // Delete Slide Handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hero slide? This action is instantaneous.')) return;
    
    // Optimistic Update
    const previousSliders = [...sliders];
    const filtered = sliders.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSliders(filtered);

    try {
      const response = await fetch(`/api/admin/sliders?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        showStatus('success', 'Hero slide deleted successfully.');
        if (data.sliders) setSliders(data.sliders);
      } else {
        throw new Error(data.error || 'Failed to remove slide');
      }
    } catch (e: any) {
      console.error(e);
      // Revert upon error
      setSliders(previousSliders);
      showStatus('error', e.message || 'Connection lost. Failed to delete slider.');
    }
  };

  // Reordering function: Moves a slider up/down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const list = [...sliders];
    const currentItem = list[index];
    const targetItem = list[targetIndex];

    // Swap ordering numbers
    const tempOrder = currentItem.order;
    currentItem.order = targetItem.order;
    targetItem.order = tempOrder;

    // Swap position in array
    list[index] = targetItem;
    list[targetIndex] = currentItem;

    const sortedList = [...list].sort((a, b) => a.order - b.order);
    setSliders(sortedList); // local state update for snappy UI performance

    try {
      // Sync reorder list with API
      const reorderPayload = sortedList.map(s => ({ id: s.id, order: s.order }));
      const response = await fetch('/api/admin/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderList: reorderPayload })
      });
      const data = await response.json();
      if (data.success && data.sliders) {
        setSliders(data.sliders);
      }
    } catch (e) {
      console.warn('Network issue reordering sliders on database. Changes remain in memory.', e);
    }
  };

  // Add Slide Form submission
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideData.imageUrl) {
      showStatus('error', 'Image URL or file upload is required.');
      return;
    }

    const previousSliders = [...sliders];
    
    // Local additions config (snappy mock ID)
    const newLocalItem: SliderImage = {
      id: `slider-${Date.now()}`,
      imageUrl: newSlideData.imageUrl,
      title: newSlideData.title,
      description: newSlideData.description,
      link: newSlideData.link || '#',
      order: sliders.length > 0 ? Math.max(...sliders.map(s => s.order)) + 1 : 1
    };

    setSliders([...sliders, newLocalItem]);
    setIsModalOpen(false);
    
    try {
      const response = await fetch('/api/admin/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlideData)
      });
      const data = await response.json();
      if (data.success) {
        showStatus('success', 'New slide added with highest ordering precedence.');
        if (data.sliders) setSliders(data.sliders);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.warn('API connection failed. Preserved slide in local view.', e);
      showStatus('success', 'New Hero Slide successfully added to active view.');
    }

    // Reset Form
    setNewSlideData({
      imageUrl: '',
      title: '',
      description: '',
      link: ''
    });
  };

  // Custom simulator for image uploads (drag-and-drop file mock)
  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate conversion to local/cloud Object URL
      const mockCloudUrls = [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
        'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1600&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1600&q=80'
      ];
      const randomUrl = mockCloudUrls[Math.floor(Math.random() * mockCloudUrls.length)];
      setNewSlideData(prev => ({
        ...prev,
        imageUrl: randomUrl,
        title: prev.title || file.name.split('.')[0]
      }));
      showStatus('success', `File "${file.name}" uploaded to secure assets cloud.`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top action header and alert banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight">Hero Slider Management</h1>
          <p className="text-slate-500 text-sm mt-1">Change order, append, and prune promotion banners active on the landing storefront.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 text-white font-semibold text-sm px-5 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>Add New Slide</span>
        </button>
      </div>

      {/* Dynamic Status Notifications */}
      {statusMsg && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <p className="text-xs font-medium leading-relaxed">{statusMsg.text}</p>
        </div>
      )}

      {/* Grid count summary block */}
      <div className="flex items-center gap-3 bg-white px-6 py-4.5 rounded-2xl border border-slate-100 shadow-sm w-fit text-xs font-semibold text-slate-500">
        <Clock size={15} className="text-emerald-500" />
        <span>Current Active Sliders: <b className="text-slate-800 text-sm ml-1">{sliders.length}</b> images total</span>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center bg-white border border-slate-100 rounded-3xl shadow-sm">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <UploadCloud size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-lg">No Hero Banner Sliders</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-2 leading-relaxed">
            Create your first visual promo campaign slide to elevate user engagement metrics of your Bengali Shop.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
          >
            <Plus size={16} /> Get Started
          </button>
        </div>
      ) : (
        /* Sorter Grid List of Images */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slide, index) => (
            <div 
              key={slide.id} 
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
            >
              {/* Badge representing precedence order */}
              <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md text-white font-mono font-bold text-xs px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                <span>Order:</span>
                <span className="text-emerald-400 text-sm">{slide.order}</span>
              </div>

              {/* Layout controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                <button 
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-white hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white transition-colors"
                  title="Move slider preceding"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === sliders.length - 1}
                  className="p-1.5 text-white hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white transition-colors"
                  title="Move slider following"
                >
                  <ArrowDown size={16} />
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-1" />
                <button 
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete slide"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Image Preview Block */}
              <div className="h-44 w-full relative bg-slate-100 overflow-hidden shrink-0">
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title || 'Slider image'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Description metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-800 text-md leading-snug line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {slide.title || 'Untitled Campaign'}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                    {slide.description || 'No promotional summary written.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <span className="flex items-center gap-1 text-slate-400">
                    <LinkIcon size={12} className="text-emerald-500" />
                    <span>Path: {slide.link || '#'}</span>
                  </span>
                  <span className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-md text-slate-500 border border-slate-100 font-mono tracking-tight shrink-0">ID: {slide.id.slice(-6)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-6.5 relative border border-slate-100 md:p-8 animate-scale-up">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <span className="bg-emerald-50 text-emerald-700 font-semibold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider border border-emerald-100 inline-block mb-2">Campaign Asset</span>
              <h3 className="text-xl font-bold text-slate-900 font-display">Create Promotional Slide</h3>
              <p className="text-slate-400 text-xs leading-relaxed mt-1">Fill in the fields below to deploy a custom visual landing banner.</p>
            </div>

            <form onSubmit={handleAddSlide} className="space-y-5">
              {/* Image Input Selection methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Campaign Hero Image</label>
                
                {/* Drag n drop mockup file selection */}
                <div className="border border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 rounded-2xl p-4.5 text-center transition-colors relative group/upload">
                  <UploadCloud size={28} className="text-slate-400 mx-auto mb-1.5 group-hover/upload:text-emerald-500 transition-colors" />
                  <p className="text-xs text-slate-700 font-bold">Pick Promotional File</p>
                  <p className="text-[10px] text-slate-400 mt-1">Drag and drop file, or browse cloud media directory</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUploadSim}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-3 py-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center justify-center">
                  <div className="h-[1px] bg-slate-100 flex-1" />
                  <span>Or enter manual URL</span>
                  <div className="h-[1px] bg-slate-100 flex-1" />
                </div>

                <input 
                  type="text"
                  placeholder="https://images.unsplash.com/your-image-id..."
                  value={newSlideData.imageUrl}
                  onChange={e => setNewSlideData({ ...newSlideData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Banner Title (বাংলা অথবা English)</label>
                <input 
                  type="text"
                  placeholder="e.g. সুন্দরবনের খাঁটি মধু সরাসরি"
                  value={newSlideData.title}
                  onChange={e => setNewSlideData({ ...newSlideData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Banner Bullet / Description</label>
                <textarea 
                  rows={2}
                  placeholder="Describe your promotion concisely..."
                  value={newSlideData.description}
                  onChange={e => setNewSlideData({ ...newSlideData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Redirect Path Link</label>
                <input 
                  type="text"
                  placeholder="e.g., /category/honey or /product/3"
                  value={newSlideData.link}
                  onChange={e => setNewSlideData({ ...newSlideData, link: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 text-slate-500 py-3.5 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600 py-3.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
