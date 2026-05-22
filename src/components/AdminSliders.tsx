import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  UploadCloud,
  Clock,
  Edit
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { SliderImage } from '../types';
import { compressImage } from '../lib/imageUtils';

const INITIAL_SLIDERS = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=1600&q=80',
    title: 'মাটির সোঁদা গন্ধে, মমতার স্পর্শে',
    description: 'গ্রামের কৃষকের ঘাম আর কারিগরের মমতা মাখা খাঁটি পণ্য এখন সরাসরি আপনার দোরগোড়ায়।',
    link: '/category/all',
    order: 1,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1600&q=80',
    title: 'ঐতিহ্যবাহী খাঁটি মশলা',
    description: 'বিখ্যাত চট্টগ্রামের মেজবানি রান্নার আসল স্বাদ পেতে আমাদের স্পেশাল গোপন মশলা।',
    link: '/category/spices',
    order: 2,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e783137?w=1600&q=80',
    title: 'সুন্দরবনের খাঁটি মধু',
    description: 'রাঙ্গামাটির গভীর জঙ্গল ও সুন্দরবন থেকে সংগৃহীত খাঁটি মধু, শতভাগ কৃত্রিম উপাদানমুক্ত।',
    link: '/category/honey',
    order: 3,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1626132646529-5003375a954e?w=1600&q=80',
    title: 'উপকূলের তাজা শুঁটকি',
    description: 'প্রাকৃতিকভাবে শুকানো, কোনো রাসায়নিক ছাড়া তৈরি আসল স্বাদের লইট্টা ও ছুরি শুঁটকি।',
    link: '/category/dry-fish',
    order: 4,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=1600&q=80',
    title: 'জৈব ও প্রাকৃতিক চাষাবাদ',
    description: 'আমাদের সকল পণ্য সম্পূর্ণ প্রাকৃতিক উপায়ে উৎপাদিত ও পরম যত্নে সংগৃহীত।',
    link: '/category/organic',
    order: 5,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1600&q=80',
    title: 'পাবনার গাওয়া ঘি ও দুগ্ধজাত পণ্য',
    description: 'ঐতিহ্যবাহী পদ্ধতিতে তৈরি খাঁটি ঘি আপনার খাবারে যোগ করবে অতুলনীয় আভিজাত্য।',
    link: '/category/ghee',
    order: 6,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511208687438-2c5a5abb810c?w=1600&q=80',
    title: 'মানিকগঞ্জের ঘানি-ভাঙা সরিষার তেল',
    description: 'নিজে ঘানি টেনে বের করা খাঁটি তেলের তীব্র ঝাঁঝ ও মনমাতানো সুবাস।',
    link: '/category/spices',
    order: 7,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1608697138356-dfc0032cc629?w=1600&q=80',
    title: 'বাংলার কারিগরদের ঐতিহ্যবাহী মৃৎশিল্প',
    description: 'মমতা ও ঐতিহ্যের ছোঁয়ায় তৈরি খাঁটি দেশীয় মাটির বাসন-কোসন ও সাজসজ্জা।',
    link: '/category/crafts',
    order: 8,
  }
];

export function AdminSliders() {
  const [sliders, setSliders] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingSlider, setEditingSlider] = useState<SliderImage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newSlide, setNewSlide] = useState({
    imageUrl: '',
    title: '',
    description: '',
    link: ''
  });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadSliders = async () => {
    setLoading(true);
    try {
      let data = await adminService.getSliders();
      if (!data || data.length === 0) {
        // Automatically preseed with our 8 high-fidelity images if the database is initially empty
        const promises = INITIAL_SLIDERS.map(slide => adminService.addSlider(slide));
        await Promise.all(promises);
        data = await adminService.getSliders();
      }
      setSliders(data || []);
    } catch (e: any) {
      console.error('Error fetching sliders:', e);
      showStatus('error', 'Failed to retrieve sliders from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminService.deleteSlider(deleteConfirmId);
      showStatus('success', 'Slider image removed from campaign list.');
      setDeleteConfirmId(null);
      loadSliders();
    } catch (e) {
      showStatus('error', 'Permission denied or database offline.');
      setDeleteConfirmId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliders.length) return;

    const list = [...sliders];
    const current = list[index];
    const target = list[targetIndex];

    const tempOrder = current.order;
    current.order = target.order;
    target.order = tempOrder;

    setLoading(true);
    try {
      await Promise.all([
        adminService.updateSlider(current.id, { order: current.order }),
        adminService.updateSlider(target.id, { order: target.order })
      ]);
      showStatus('success', 'Banner display order updated.');
      loadSliders();
    } catch (e) {
      showStatus('error', 'Failed to save slider order.');
      setLoading(false);
    }
  };

  const handleCreateSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.imageUrl) {
      showStatus('error', 'An image URL is required.');
      return;
    }

    try {
      if (editingSlider) {
        await adminService.updateSlider(editingSlider.id, {
          imageUrl: newSlide.imageUrl,
          title: newSlide.title,
          description: newSlide.description,
          link: newSlide.link
        });
        showStatus('success', 'Slider updated successfully.');
      } else {
        const orderNo = sliders.length > 0 ? Math.max(...sliders.map(s => s.order)) + 1 : 1;
        await adminService.addSlider({
          ...newSlide,
          order: orderNo
        });
        showStatus('success', 'Slider created successfully.');
      }
      setIsModalOpen(false);
      setEditingSlider(null);
      setNewSlide({ imageUrl: '', title: '', description: '', link: '' });
      loadSliders();
    } catch (e) {
      showStatus('error', 'Error writing slider to collection.');
    }
  };

  const handleUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const original = reader.result as string;
          // Compress to max 1200px width/height, 0.7 quality (excellent for responsive storefront banners)
          const compressed = await compressImage(original, 1200, 1200, 0.7);
          
          setNewSlide(prev => ({
            ...prev,
            imageUrl: compressed,
            title: prev.title || file.name.split('.')[0]
          }));
          showStatus('success', `File "${file.name}" uploaded successfully.`);
        } catch (err) {
          console.error('Slider compression failed:', err);
          showStatus('error', 'Failed to process image. Try a smaller size.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        showStatus('error', 'Failed to read image file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Head section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-display font-black text-accent-deep">Manage Showcase Banners</h2>
          <p className="text-gray-500 text-xs mt-1">Order and configure promotional slide shows visible to shoppers on the storefront.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-accent-deep transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold">{statusMsg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <UploadCloud size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="font-bold text-accent-deep text-lg">No Banners Present</h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            Drag files or add image URLs to display banner events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sliders.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 group relative flex flex-col hover:border-primary hover:shadow-lg transition-all duration-300">
              {/* Index indicator */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 font-bold text-xs flex items-center gap-1.5 shadow-md">
                <span>Display order:</span>
                <span className="text-primary font-bold text-sm">{slide.order}</span>
              </div>

              {/* Action layout controls overlay */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                <button 
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-white hover:text-primary disabled:opacity-30 transition-colors"
                  title="Move banner left/preceding"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === sliders.length - 1}
                  className="p-1.5 text-white hover:text-primary disabled:opacity-30 transition-colors"
                  title="Move banner right/succeeding"
                >
                  <ArrowDown size={16} />
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-1" />
                <button 
                  onClick={() => {
                    setEditingSlider(slide);
                    setNewSlide({
                      imageUrl: slide.imageUrl,
                      title: slide.title,
                      description: slide.description,
                      link: slide.link
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                  title="Edit slide text and image"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(slide.id)}
                  className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete slide"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Cover Preview Image */}
              <div className="h-44 w-full relative bg-surface overflow-hidden shrink-0">
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title || 'Slide show item'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Metadata area */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-accent-deep text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {slide.title || 'General Promo Campaign'}
                  </h4>
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed font-light">
                    {slide.description || 'No campaign summary or description written.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-gray-400 truncate max-w-[160px]">
                    <LinkIcon size={12} className="text-primary" />
                    <span className="truncate">{slide.link || '#'}</span>
                  </span>
                  <span className="text-[10px] bg-surface px-2.5 py-1 rounded-md text-gray-400 border border-gray-50 font-mono tracking-tight shrink-0 select-all">
                    ID: {slide.id.slice(-6)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative border border-gray-100">
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setEditingSlider(null);
                setNewSlide({ imageUrl: '', title: '', description: '', link: '' });
              }} 
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-primary transition-colors hover:bg-surface rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-display font-black text-accent-deep mb-2">
              {editingSlider ? 'Edit Showcase Banner' : 'Create Showcase Banner'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {editingSlider ? 'Modify the properties of this storefront promotion slide.' : 'Setup a new promotional events slide for the home storefront page.'}
            </p>

            <form onSubmit={handleCreateSlider} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Slide Show Cover</label>
                
                <div className="flex items-center gap-4">
                  {newSlide.imageUrl && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-surface shrink-0">
                      <img 
                        src={newSlide.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  
                  {/* File picker simulation */}
                  <div className="flex-1 border border-dashed border-gray-200 hover:border-primary bg-surface rounded-2xl p-4 text-center transition-colors relative group/upload">
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1" />
                        <p className="text-[10px] text-primary font-bold">Uploading & compressing picture...</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={20} className="mx-auto text-gray-400 mb-0.5 group-hover/upload:text-primary" />
                        <p className="text-[11px] text-accent-deep font-bold">Pick Cover Picture</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleUploadSim}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-1 text-gray-400 text-[9px] font-bold uppercase tracking-widest">
                  <div className="h-[1px] bg-gray-100 flex-1" />
                  <span>Or type image link URL</span>
                  <div className="h-[1px] bg-gray-100 flex-1" />
                </div>

                <input 
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium text-accent-deep"
                  value={newSlide.imageUrl}
                  onChange={e => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Headline Header</label>
                <input 
                  type="text"
                  placeholder="e.g. পাবনার গাওয়া ঘি ও ক্ষীর"
                  className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-accent-deep"
                  value={newSlide.title}
                  onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Supporting Description</label>
                <textarea 
                  rows={2}
                  placeholder="Concise tagline for the checkout promotion..."
                  className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-accent-deep resize-none"
                  value={newSlide.description}
                  onChange={e => setNewSlide({ ...newSlide, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Store Link Redirect Path</label>
                <input 
                  type="text"
                  placeholder="e.g., /category/organic or /product/4"
                  className="w-full bg-surface p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-accent-deep"
                  value={newSlide.link}
                  onChange={e => setNewSlide({ ...newSlide, link: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSlider(null);
                    setNewSlide({ imageUrl: '', title: '', description: '', link: '' });
                  }}
                  className="flex-1 bg-surface text-gray-500 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-accent-deep transition-all shadow-xl shadow-primary/20 text-sm"
                >
                  {editingSlider ? 'Update Banner' : 'Save Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-accent-deep/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl p-6 relative border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-display font-black text-accent-deep mb-2">Delete Banner?</h3>
            <p className="text-gray-500 text-xs mb-6">Are you sure you want to permanently remove this showcase slider? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-surface text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmDelete}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
