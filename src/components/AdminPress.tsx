import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  CheckCircle2, 
  AlertCircle,
  UploadCloud,
  Edit,
  ExternalLink,
  Newspaper
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { PressCoverage } from '../types';
import { compressImage } from '../lib/imageUtils';

const INITIAL_PRESS = [
  {
    source: "প্রথম আলো",
    title: "খাদ্য ভেজালের ভিড়ে এক অনন্য আস্থার নাম ‘আহরোণ’",
    excerpt: "সুন্দরবনের গহীন জঙ্গল থেকে শুরু করে পাবনার দুগ্ধ খামার—সব জায়গায় নিজেদের প্রতিনিধির মাধ্যমে শতভাগ খাঁটি ও ভেজালমুক্ত ঐতিহ্যবাহী খাদ্যপণ্য শহরের মানুষের দুয়ারে পৌঁছে দিচ্ছে আহরোণ।",
    img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
    link: "https://www.prothomalo.com",
    date: "জানুয়ারি ১৫, ২০২৬",
    order: 1
  },
  {
    source: "দ্য ডেইলি স্টার",
    title: "Ahoron: Pure ingredients straight from local farms",
    excerpt: "By weeding out middle-men and verifying purity at origin, start-up Ahoron is empowering grassroot level honey hunters, ghee masters, and mustard farmers across Bangladesh with fair value.",
    img: "https://images.unsplash.com/photo-1546422904-90eabf3bac0a?w=800&q=80",
    link: "https://www.thedailystar.net",
    date: "মার্চ ০৫, ২০২৬",
    order: 2
  },
  {
    source: "কালের কণ্ঠ",
    title: "সরিষা ও মধুর আসল স্বাদ ফিরিয়ে আনছে তরুণেরা",
    excerpt: "নিজস্ব তত্ত্বাবধানে ঘানিভাঙা তেল আর সুন্দরবনের প্রাকৃতিক মধুর অসাধারণ স্বাদ নিয়ে ক্রেতাদের আস্থার জায়গা হয়ে উঠেছে এই উদ্যোগ। তাদের গুনগত মান রক্ষা এবং কারিগরবান্ধব পলিসি সত্যিই অতুলনীয়।",
    img: "https://images.unsplash.com/photo-1588681664899-f142ff2af9b3?w=800&q=80",
    link: "https://www.kalerkantho.com",
    date: "এপ্রিল ২০, ২০২৬",
    order: 3
  }
];

export function AdminPress() {
  const [pressList, setPressList] = useState<PressCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingPress, setEditingPress] = useState<PressCoverage | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    source: '',
    title: '',
    excerpt: '',
    img: '',
    link: '',
    date: ''
  });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadPress = async () => {
    setLoading(true);
    try {
      let data = await adminService.getPress();
      if (!data || data.length === 0) {
        // Automatically preseed with our 3 high-fidelity records if empty
        const promises = INITIAL_PRESS.map(press => adminService.addPress(press));
        await Promise.all(promises);
        data = await adminService.getPress();
      }
      setPressList(data || []);
    } catch (e: any) {
      console.error('Error fetching press list:', e);
      showStatus('error', 'Failed to retrieve news coverages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPress();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminService.deletePress(deleteConfirmId);
      showStatus('success', 'Media clipping removed successfully.');
      setDeleteConfirmId(null);
      loadPress();
    } catch (e) {
      showStatus('error', 'Permission denied or database offline.');
      setDeleteConfirmId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pressList.length) return;

    const list = [...pressList];
    const current = list[index];
    const target = list[targetIndex];

    const tempOrder = current.order;
    current.order = target.order;
    target.order = tempOrder;

    setLoading(true);
    try {
      await Promise.all([
        adminService.updatePress(current.id, { order: current.order }),
        adminService.updatePress(target.id, { order: target.order })
      ]);
      showStatus('success', 'News clipping display order updated.');
      loadPress();
    } catch (e) {
      showStatus('error', 'Failed to save order updates.');
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source || !formData.title || !formData.excerpt || !formData.img || !formData.date) {
      showStatus('error', 'All fields except link are required.');
      return;
    }

    try {
      if (editingPress) {
        await adminService.updatePress(editingPress.id, {
          source: formData.source,
          title: formData.title,
          excerpt: formData.excerpt,
          img: formData.img,
          link: formData.link || '#',
          date: formData.date
        });
        showStatus('success', 'News clipping updated successfully.');
      } else {
        const orderNo = pressList.length > 0 ? Math.max(...pressList.map(p => p.order)) + 1 : 1;
        await adminService.addPress({
          ...formData,
          link: formData.link || '#',
          order: orderNo
        });
        showStatus('success', 'News clipping added successfully.');
      }
      setIsModalOpen(false);
      setEditingPress(null);
      setFormData({ source: '', title: '', excerpt: '', img: '', link: '', date: '' });
      loadPress();
    } catch (e) {
      showStatus('error', 'Error writing press data to Firestore.');
    }
  };

  const handleUploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const original = reader.result as string;
          // Compress to max 800px width/height, 0.75 quality (perfect for newspaper clipping or logo visuals)
          const compressed = await compressImage(original, 900, 600, 0.75);
          
          setFormData(prev => ({
            ...prev,
            img: compressed
          }));
          showStatus('success', `Image "${file.name}" processed successfully.`);
        } catch (err) {
          console.error('Image processing failed:', err);
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
          <h2 className="text-xl font-display font-black text-accent-deep">Manage News Coverage (কোলাজ ও মিডিয়া কাভারেজ)</h2>
          <p className="text-gray-500 text-xs mt-1">Configure and manage press clippings, online newspaper coverage and television story notes shown on Home screen.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPress(null);
            setFormData({ source: '', title: '', excerpt: '', img: '', link: '', date: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-accent-deep transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Add News Clip
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
      ) : pressList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <Newspaper size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="font-bold text-accent-deep text-lg">No News Coverage Present</h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            Create profiles of media items to display on the brand story.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pressList.map((press, index) => (
            <div key={press.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 group relative flex flex-col hover:border-primary hover:shadow-lg transition-all duration-300">
              {/* Display order tag */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 font-bold text-xs flex items-center gap-1.5 shadow-md">
                <span>Display Order:</span>
                <span className="text-primary font-bold text-sm">{press.order}</span>
              </div>

              {/* Action layout controls overlay */}
              <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                <button 
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-white hover:text-primary disabled:opacity-30 transition-colors"
                  title="Move sequence left"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === pressList.length - 1}
                  className="p-1.5 text-white hover:text-primary disabled:opacity-30 transition-colors"
                  title="Move sequence right"
                >
                  <ArrowDown size={16} />
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-1" />
                <button 
                  onClick={() => {
                    setEditingPress(press);
                    setFormData({
                      source: press.source,
                      title: press.title,
                      excerpt: press.excerpt,
                      img: press.img,
                      link: press.link,
                      date: press.date
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-white hover:text-primary transition-colors"
                  title="Edit details"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(press.id)}
                  className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                  title="Delete newspaper clipping"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Cover Graphic Card Area */}
              <div className="aspect-[16/10] w-full bg-slate-50 relative overflow-hidden border-b border-gray-100">
                <img 
                  src={press.img} 
                  alt={press.source} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 font-bold text-[10px] tracking-wider uppercase bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-100">
                      {press.source}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {press.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-accent-deep group-hover:text-primary transition-colors leading-snug line-clamp-2">{press.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{press.excerpt}</p>
                </div>

                {press.link && press.link !== '#' && (
                  <div className="pt-2">
                    <a 
                      href={press.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      মূল খবরটি পড়ুন <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write/Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl border border-gray-100 relative z-10 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-display font-black text-accent-deep mb-6">
              {editingPress ? 'Edit News Clipping' : 'Add Newspaper Clipping'}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Source Name (উদা: প্রথম আলো)</label>
                  <input 
                    type="text" 
                    value={formData.source}
                    onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                    placeholder="উদা: প্রথম আলো" 
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500">Date (উদা: জানুয়ারি ১৫, ২০২৬)</label>
                  <input 
                    type="text" 
                    value={formData.date}
                    onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                    placeholder="উদা: মার্চ ০৫, ২০২৬" 
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">News Title / Heading (খবরের শিরোনাম)</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder="উদা: গ্রামের খাঁটি পণ্য সরাসরি রান্নাঘরে পৌঁছাচ্ছে আহরোণ" 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 flex justify-between items-center">
                  <span>Newspaper Cover Image</span>
                  {isUploading && <span className="text-[10px] text-primary animate-pulse font-medium">Processing...</span>}
                </label>
                <div className="grid grid-cols-5 gap-3 items-center">
                  <div className="col-span-2 group relative border border-dashed border-gray-200 hover:border-primary rounded-xl aspect-[16/10] flex flex-col justify-center items-center overflow-hidden cursor-pointer transition-colors bg-slate-50 p-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUploadImg}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {formData.img ? (
                      <img src={formData.img} alt="Preview" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-gray-400 group-hover:text-primary transition-colors mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold group-hover:text-primary transition-colors text-center">Upload Clip</span>
                      </>
                    )}
                  </div>
                  <div className="col-span-3 space-y-1">
                    <span className="text-[10px] text-gray-400 block font-light">Or enter image web address link:</span>
                    <input 
                      type="text" 
                      value={formData.img}
                      onChange={e => setFormData(p => ({ ...p, img: e.target.value }))}
                      placeholder="https://images.unsplash.com/..." 
                      className="w-full px-3 py-2 border border-gray-100 rounded-xl focus:border-primary transition-all text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Original Article Link / URL (ঐচ্ছিক)</label>
                <input 
                  type="url" 
                  value={formData.link}
                  onChange={e => setFormData(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://www.prothomalo.com/article/ahoron" 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">News Summary / Content Excerpt (খবরের সারসংক্ষেপ)</label>
                <textarea 
                  rows={4}
                  value={formData.excerpt}
                  onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="সংবাদপত্রে আহরোণ নিয়ে করা মূল রিপোর্ট ও বর্ণনার কিছু অংশ এখানে তুলে ধরুন..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-xs outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-accent-deep transition-all shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2"
              >
                {editingPress ? 'Save Changes' : 'Create Newspaper Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setDeleteConfirmId(null)} />
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 relative z-10 text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-accent-deep text-lg">Remove News Coverage?</h4>
              <p className="text-gray-500 text-xs">Are you sure you want to delete this press record? This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
