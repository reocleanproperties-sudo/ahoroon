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
  User
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { Producer } from '../types';
import { compressImage } from '../lib/imageUtils';

const INITIAL_PRODUCERS = [
  {
    name: "আব্দুল মজিদ",
    role: "মধু সংগ্রহকারী, সুন্দরবন",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
    story: "৩ পুরুষ ধরে তারা সুন্দরবনের খাঁটি মধু সংগ্রহ করেন। তার পরম শ্রদ্ধায় সংগৃহীত আসল মধু পৌঁছে যায় আপনার দোরগোড়ায়।",
    order: 1
  },
  {
    name: "রাবেয়া বেগম",
    role: "হাতে তৈরি ঘি কারিগর, পাবনা",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    story: "ঐতিহ্যবাহী গাওয়া পদ্ধতিতে নিজস্ব গাভীর খাঁটি দুধ হতে সর বানিয়ে ঘি প্রস্তুত করেন। কোনো রাসায়নিক ও প্রিজারভেটিভ নেই।",
    order: 2
  },
  {
    name: "করিম চাচা",
    role: "সরিষা চাষী, মানিকগঞ্জ",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    story: "নিজে খাঁটি সরিষা বুনে ঘানি ভেঙে প্রাকৃতিক তেল নিষ্কাশন করেন। যে তেলের উগ্র ঝাঁঝ ও সেন্ট রান্নায় এনে দেয় আভিজাত্যের স্পর্শ।",
    order: 3
  }
];

export function AdminProducers() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    img: '',
    story: ''
  });

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const loadProducers = async () => {
    setLoading(true);
    try {
      let data = await adminService.getProducers();
      if (!data || data.length === 0) {
        // Automatically preseed with our 3 high-fidelity producers if empty
        const promises = INITIAL_PRODUCERS.map(producer => adminService.addProducer(producer));
        await Promise.all(promises);
        data = await adminService.getProducers();
      }
      setProducers(data || []);
    } catch (e: any) {
      console.error('Error fetching producers:', e);
      showStatus('error', 'Failed to retrieve producers from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducers();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await adminService.deleteProducer(deleteConfirmId);
      showStatus('success', 'Producer profile removed successfully.');
      setDeleteConfirmId(null);
      loadProducers();
    } catch (e) {
      showStatus('error', 'Permission denied or database offline.');
      setDeleteConfirmId(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= producers.length) return;

    const list = [...producers];
    const current = list[index];
    const target = list[targetIndex];

    const tempOrder = current.order;
    current.order = target.order;
    target.order = tempOrder;

    setLoading(true);
    try {
      await Promise.all([
        adminService.updateProducer(current.id, { order: current.order }),
        adminService.updateProducer(target.id, { order: target.order })
      ]);
      showStatus('success', 'Producer displaying order updated.');
      loadProducers();
    } catch (e) {
      showStatus('error', 'Failed to save order updates.');
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.img || !formData.story) {
      showStatus('error', 'All fields are required.');
      return;
    }

    try {
      if (editingProducer) {
        await adminService.updateProducer(editingProducer.id, {
          name: formData.name,
          role: formData.role,
          img: formData.img,
          story: formData.story
        });
        showStatus('success', 'Producer profile updated successfully.');
      } else {
        const orderNo = producers.length > 0 ? Math.max(...producers.map(p => p.order)) + 1 : 1;
        await adminService.addProducer({
          ...formData,
          order: orderNo
        });
        showStatus('success', 'Producer profile added successfully.');
      }
      setIsModalOpen(false);
      setEditingProducer(null);
      setFormData({ name: '', role: '', img: '', story: '' });
      loadProducers();
    } catch (e) {
      showStatus('error', 'Error writing producer data to Firestore.');
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
          // Compress to max 800px width/height, 0.75 quality (perfect for circular/square avatar images)
          const compressed = await compressImage(original, 800, 800, 0.75);
          
          setFormData(prev => ({
            ...prev,
            img: compressed
          }));
          showStatus('success', `Image "${file.name}" uploaded successfully.`);
        } catch (err) {
          console.error('Producer image compression failed:', err);
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
          <h2 className="text-xl font-display font-black text-accent-deep">Manage Producers (উদ্যোক্তা ও কারিগর)</h2>
          <p className="text-gray-500 text-xs mt-1">Configure and manage biographies of deep-country producers displayed in Home screen Section 3.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProducer(null);
            setFormData({ name: '', role: '', img: '', story: '' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-accent-deep transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Add Producer
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
      ) : producers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <UploadCloud size={40} className="mx-auto text-gray-300 mb-3" />
          <h4 className="font-bold text-accent-deep text-lg">No Producers Present</h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            Create profiles of authentic makers and farmers to exhibit on the homepage section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {producers.map((producer, index) => (
            <div key={producer.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 group relative flex flex-col hover:border-primary hover:shadow-lg transition-all duration-300">
              {/* Display order tag */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10 font-bold text-xs flex items-center gap-1.5 shadow-md">
                <span>Display Order:</span>
                <span className="text-primary font-bold text-sm">{producer.order}</span>
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
                  disabled={index === producers.length - 1}
                  className="p-1.5 text-white hover:text-primary disabled:opacity-30 transition-colors"
                  title="Move sequence right"
                >
                  <ArrowDown size={16} />
                </button>
                <div className="w-[1px] bg-white/10 my-1 mx-1" />
                <button 
                  onClick={() => {
                    setEditingProducer(producer);
                    setFormData({
                      name: producer.name,
                      role: producer.role,
                      img: producer.img,
                      story: producer.story
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-white hover:text-primary transition-colors"
                  title="Edit details"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(producer.id)}
                  className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                  title="Delete producer card"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Cover Graphic Card Area */}
              <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden border-b border-gray-100">
                <img 
                  src={producer.img} 
                  alt={producer.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-amber-600 font-bold text-[10px] tracking-wider uppercase bg-amber-50 rounded-full px-2.5 py-1 border border-amber-100 inline-block">
                    {producer.role}
                  </span>
                  <h3 className="text-lg font-bold text-accent-deep group-hover:text-primary transition-colors">{producer.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-4">{producer.story}</p>
                </div>
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
              {editingProducer ? 'Edit Producer Profile' : 'Add New Producer'}
            </h3>

            <form onSubmit={handleCreateOrUpdate} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Producer Name (বাংলায়)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="উদা: আব্দুল মজিদ" 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Role / Location (বাংলায়)</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                  placeholder="উদা: মধু সংগ্রহকারী, সুন্দরবন" 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 flex justify-between items-center">
                  <span>Photo / Avatar</span>
                  {isUploading && <span className="text-[10px] text-primary animate-pulse font-medium">Processing...</span>}
                </label>
                <div className="grid grid-cols-5 gap-3 items-center">
                  <div className="col-span-2 group relative border border-dashed border-gray-200 hover:border-primary rounded-xl aspect-square flex flex-col justify-center items-center overflow-hidden cursor-pointer transition-colors bg-slate-50 p-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleUploadImg}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {formData.img ? (
                      <img src={formData.img} alt="Avatar preview" className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <UploadCloud size={20} className="text-gray-400 group-hover:text-primary transition-colors mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold group-hover:text-primary transition-colors text-center text-wrap px-1">Upload File</span>
                      </>
                    )}
                  </div>
                  <div className="col-span-3 space-y-1">
                    <span className="text-[10px] text-gray-400 block font-light">Or enter custom image web address link:</span>
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
                <label className="text-xs font-bold text-gray-500">Producer Story / Biography (বাংলায়)</label>
                <textarea 
                  rows={4}
                  value={formData.story}
                  onChange={e => setFormData(p => ({ ...p, story: e.target.value }))}
                  placeholder="তাদের ঐতিহ্যবাহী কাজের বিবরণ, সততা ও পরম স্নেহে যেভাবে তারা পণ্য উৎপাদন করছেন সেই গল্পটি লিখুন..." 
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-xs outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm tracking-wide hover:bg-accent-deep transition-all shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2"
              >
                {editingProducer ? 'Save Changes' : 'Create Profile'}
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
              <h4 className="font-bold text-accent-deep text-lg">Remove Producer?</h4>
              <p className="text-gray-500 text-xs">Are you sure you want to delete this maker card? This is final.</p>
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
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
