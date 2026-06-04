import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

export const Footer = () => {
  const [footerLogo, setFooterLogo] = useState<string>(
    localStorage.getItem('siteFooterLogo') || localStorage.getItem('siteLogo') || ""
  );

  useEffect(() => {
    adminService.getSettings()
      .then(settings => {
        if (settings && settings.footerLogoUrl) {
          setFooterLogo(settings.footerLogoUrl);
        } else if (settings && settings.logoUrl) {
          setFooterLogo(settings.logoUrl);
        }
      })
      .catch(err => console.error("Error loading settings:", err));

    const handleLogoUpdate = () => {
      const siteFooterLogo = localStorage.getItem('siteFooterLogo');
      const siteLogo = localStorage.getItem('siteLogo');
      if (siteFooterLogo) {
        setFooterLogo(siteFooterLogo);
      } else if (siteLogo) {
        setFooterLogo(siteLogo);
      }
    };
    
    window.addEventListener('siteLogoUpdated', handleLogoUpdate);
    window.addEventListener('siteFooterLogoUpdated', handleLogoUpdate);

    return () => {
      window.removeEventListener('siteLogoUpdated', handleLogoUpdate);
      window.removeEventListener('siteFooterLogoUpdated', handleLogoUpdate);
    };
  }, []);
  return (
    <footer className="bg-white border-t border-gray-100 pt-10 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col">
          <Link to="/" className="inline-block">
            <img 
              src={footerLogo} 
              alt="আহরোণ" 
              className="h-[150px] w-[500px] max-w-full object-contain -mt-[1px] mb-[23px] pb-[3px]"
              referrerPolicy="no-referrer"
            />
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mt-[-29px] mb-6 pl-0 ml-0">
            আহরোণ—বাংলার ঐতিহ্যবাহী খাবারকে ভেজালমুক্তভাবে আপনার কাছে পৌঁছে দেওয়ার একটি বিশ্বস্ত নাম।
          </p>
          <div className="flex gap-4.5 mt-2">
            <a 
              href="https://facebook.com/ahoroonbd" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-12 h-12 rounded-full border border-slate-200 bg-slate-950 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.4)] hover:text-[#1877F2] active:scale-95 cursor-pointer shadow-xs shrink-0"
              title="Facebook"
            >
              <Facebook size={20} strokeWidth={1.8} />
            </a>
            <a 
              href="#" 
              className="w-12 h-12 rounded-full border border-slate-200 bg-slate-950 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.4)] hover:text-[#E1306C] active:scale-95 cursor-pointer shadow-xs shrink-0"
              title="Instagram"
            >
              <Instagram size={20} strokeWidth={1.8} />
            </a>
            <a 
              href="#" 
              className="w-12 h-12 rounded-full border border-slate-200 bg-slate-950 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#00f2fe] hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:text-[#00f2fe] active:scale-95 cursor-pointer shadow-xs shrink-0"
              title="TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.62 2.89 2.89 0 0 1 2.31-4.51c.36 0 .71.06 1.05.18V9.43a6.33 6.33 0 0 0-1.05-.09 6.34 6.34 0 0 0-6.14 6.34A6.34 6.34 0 0 0 10 22a6.34 6.34 0 0 0 6.33-6.24V8a8.31 8.31 0 0 0 3.26 1.25V6.69z" />
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@%E0%A6%86%E0%A6%B9%E0%A6%B0%E0%A7%8B%E0%A6%A3" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-slate-200 bg-slate-950 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] hover:text-[#FF0000] active:scale-95 cursor-pointer shadow-xs shrink-0"
              title="YouTube"
            >
              <Youtube size={20} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-accent-deep">Quick Links</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><Link to="/category/all" className="hover:text-primary transition-colors">সকল পণ্য</Link></li>
            <li><Link to="/categories" className="hover:text-primary transition-colors">বিভাগসমূহ</Link></li>
            <li><Link to="/cart" className="hover:text-primary transition-colors">আপনার ব্যাগ</Link></li>
            <li><Link to="/profile" className="hover:text-primary transition-colors">প্রোফাইল</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-accent-deep">Customer Support</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>আমাদের সম্পর্কে</li>
            <li>ডেলিভারি পলিসি</li>
            <li>রিফান্ড পলিসি</li>
            <li>প্রাইভেসি পলিসি</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-accent-deep">Contact Us</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-primary shrink-0" />
              <span>+8801796361024</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <span>info@ahoron.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
              <span>Mohammadpur, Bosila, Dhaka, Bangladesh 1207</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400">© ২০২৬ আহরোণ। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>Hygienic Packing</span>
          <span>Fast Delivery</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};
