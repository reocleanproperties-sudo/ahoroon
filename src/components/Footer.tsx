import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-10 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <Link to="/" className="logo-text text-3xl">
            আহরোণ
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed">
            আহরোণ—বাংলার ঐতিহ্যবাহী খাবারকে ভেজালমুক্তভাবে আপনার কাছে পৌঁছে দেওয়ার একটি বিশ্বস্ত নাম।
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors">
              <Twitter size={20} />
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
              <Phone size={16} className="text-primary" />
              <span>+৮৮০ ১২৩৪ ৫৬৭৮৯০</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-primary" />
              <span>info@ahoron.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={16} className="text-primary" />
              <span>চট্টগ্রাম, বাংলাদেশ</span>
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
