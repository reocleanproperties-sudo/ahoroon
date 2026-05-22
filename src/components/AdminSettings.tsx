import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { adminService } from '../services/adminService';
import { compressImage } from '../lib/imageUtils';

export default function AdminSettings() {
  const [logoUrl, setLogoUrl] = useState('');
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
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Img = await compressImage(file, 800);
      setLogoUrl(base64Img);
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Failed to process image');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings({ logoUrl });
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
          <label className="block text-sm font-medium text-gray-700">Replace Website Logo</label>
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
                  onChange={handleImageUpload}
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
      </div>
    </div>
  );
}
