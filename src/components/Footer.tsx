import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
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
          <div className="flex gap-4">
            <a href="https://facebook.com/ahoroonbd" target="_blank" rel="noopener noreferrer" className="p-3 bg-[#1877F2] rounded-xl text-white transition-all transform hover:-translate-y-1 hover:brightness-110 shadow-[0_4px_0_0_#0d5ebd,0_10px_10px_-5px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_0px_0_0_#0d5ebd,0_0px_0px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center">
              <Facebook size={22} fill="currentColor" strokeWidth={0} />
            </a>
            <a href="#" className="p-3 bg-gradient-to-tr from-[#fce043] via-[#e6683c] to-[#bc1888] rounded-xl text-white transition-all transform hover:-translate-y-1 hover:brightness-110 shadow-[0_4px_0_0_#9b1471,0_10px_10px_-5px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_0px_0_0_#9b1471,0_0px_0px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center">
              <Instagram size={22} strokeWidth={2.5} />
            </a>
            <a href="#" className="p-3 bg-black rounded-xl text-white transition-all transform hover:-translate-y-1 hover:brightness-110 shadow-[0_4px_0_0_#333,0_10px_10px_-5px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_0px_0_0_#333,0_0px_0px_-5px_rgba(0,0,0,0.3)] flex items-center justify-center">
              <Twitter size={22} fill="currentColor" strokeWidth={0} />
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
