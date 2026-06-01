import React from 'react';
import { motion } from 'motion/react';

export const WhatsAppButton = () => {
  const phoneNumber = "8801796361024";
  const message = encodeURIComponent("আসসালামু আলাইকুম, আহরোণ (Ahoron) থেকে আপনার সাথে যোগাযোগ করছি।");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
      {/* Tooltip / Label */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="hidden md:flex items-center gap-2 mb-2 bg-white/95 backdrop-blur shadow-xl border border-gray-100 rounded-xl py-1.5 px-3 pointer-events-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-gray-700 font-sans">
          সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন
        </span>
      </motion.div>

      {/* Pulsing ring background */}
      <div className="relative group">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
        
        {/* Main Floating Button */}
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-2xl hover:shadow-[#25D366]/30 transition-shadow duration-300"
          aria-label="Contact us on WhatsApp"
        >
          {/* Custom high-quality inline SVG for WhatsApp logo */}
          <svg
            className="w-8 h-8 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.012 14.053.991 11.432.99 6.002.99 1.579 5.36 1.575 10.79c-.001 1.745.485 3.425 1.408 4.9l-.328 1.196-.948 3.46 3.551-.918 1.189-.307zm11.336-7.234c-.3-.149-1.772-.863-2.046-.962-.275-.099-.475-.149-.675.15-.2.299-.775.962-.95 1.162-.175.2-.35.224-.65.074-1.206-.514-2.032-1.09-2.842-2.483-.21-.362-.058-.557.091-.707.135-.135.3-.349.45-.524.15-.175.2-.299.3-.499.1-.2.05-.374-.025-.524-.075-.15-.675-1.62-.925-2.22-.243-.584-.489-.505-.675-.514-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.299-1.05 1.023-1.05 2.494 0 1.47 1.075 2.89 1.225 3.09.15.2 2.11 3.22 5.11 4.516.714.308 1.272.493 1.706.63.717.228 1.369.196 1.884.119.574-.085 1.772-.714 2.022-1.404.25-.69.25-1.28.175-1.404-.075-.124-.275-.199-.575-.349z" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
};
