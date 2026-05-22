import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { adminService } from '../services/adminService';
import { compressImage } from '../lib/imageUtils';

export default function AdminSettings() {
  const [logoUrl, setLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await adminService.getSettings();
      if (settings && settings.logoUrl) {
        setLogoUrl(settings.logoUrl);
      }
      if (settings && settings.footerLogoUrl) {
        setFooterLogoUrl(settings.footerLogoUrl);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFooter: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;
        try {
          const compressed = await compressImage(base64String, 400, 400, 0.8);
          if (isFooter) {
            setFooterLogoUrl(compressed);
          } else {
            setLogoUrl(compressed);
          }
        } catch (err) {
          console.error("Compression error:", err);
          alert("Failed to compress image");
        }
      };
      reader.onerror = () => alert("Failed to read file");
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Failed to process image');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ logoUrl, footerLogoUrl });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div></div>;
  }

  return (
    <div className="p-4 sm:p-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Site Settings</h1>
          <p className="text-sm text-gray-500">Manage your website's general configuration.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-accent-deep text-white px-5 py-2.5 rounded-xl transition-all font-medium disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
          ) : (
            <Save size={20} />
          )}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Branding</h2>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Main Website Logo</label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-48 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Site Logo Preview" className="max-w-full max-h-full object-contain p-2" />
              ) : (
                <div className="text-gray-400 text-sm flex flex-col items-center">
                  <Upload size={24} className="mb-2" />
                  No Logo
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <label className="inline-flex items-center gap-2 bg-surface hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all cursor-pointer font-medium">
                <Upload size={18} />
                Upload New Logo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 leading-relaxed">
                Recommended size: 400x120 pixels. Max file size: 1MB. Allowed formats: JPG, PNG, WEBP.
                Use a transparent PNG for best results.
              </p>
              {logoUrl && (
                <button 
                  onClick={() => setLogoUrl('')}
                  className="text-red-500 text-sm hover:text-red-600 font-medium"
                >
                  Remove Logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
          <label className="block text-sm font-medium text-gray-700">Footer Logo</label>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-48 h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              {footerLogoUrl ? (
                <img src={footerLogoUrl} alt="Footer Logo Preview" className="max-w-full max-h-full object-contain p-2" />
              ) : (
                <div className="text-gray-400 text-sm flex flex-col items-center">
                  <Upload size={24} className="mb-2" />
                  No Logo
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <label className="inline-flex items-center gap-2 bg-surface hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all cursor-pointer font-medium">
                <Upload size={18} />
                Upload Footer Logo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 leading-relaxed">
                Optional separate logo for the footer. Recommended size: 400x120 pixels.
              </p>
              {footerLogoUrl && (
                <button 
                  onClick={() => setFooterLogoUrl('')}
                  className="text-red-500 text-sm hover:text-red-600 font-medium"
                >
                  Remove Footer Logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
          <label className="block text-sm font-medium text-gray-700">System Utilities</label>
          <div className="flex items-center justify-between bg-red-50 p-6 rounded-2xl border border-red-100">
            <div>
              <p className="font-bold text-red-900">Clear Cache & Unused Images</p>
              <p className="text-sm text-red-700/80 mt-1">
                Deletes unused image data from the local browser storage while preserving your current uploaded logos and cart data.
              </p>
            </div>
            <button
              onClick={() => {
                const preserveKeys = ['siteLogo', 'siteFooterLogo', 'cart_items_v1']; // Example keys to keep
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && !preserveKeys.includes(key) && !key.startsWith('firebase:')) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                alert('Local cache has been cleared successfully.');
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shrink-0 shadow-lg shadow-red-200"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
