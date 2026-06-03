import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminService } from '../services/adminService';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string>(
    localStorage.getItem('siteFooterLogo') || localStorage.getItem('siteLogo') || ""
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Instantly attempt to load footer logo from firebase settings if not cached or to verify freshness
    adminService.getSettings()
      .then(settings => {
        if (settings) {
          if (settings.footerLogoUrl) {
            setLogoUrl(settings.footerLogoUrl);
            localStorage.setItem('siteFooterLogo', settings.footerLogoUrl);
          } else if (settings.logoUrl) {
            setLogoUrl(settings.logoUrl);
            localStorage.setItem('siteLogo', settings.logoUrl);
          }
        }
      })
      .catch(err => console.error("Error loading logo in Preloader:", err));

    // 2. Animate progress bar incrementally over 1.8 seconds
    const duration = 1800; // 1.8 seconds
    const intervalMs = 25;
    const totalSteps = duration / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min((currentStep / totalSteps) * 100, 100);
      setProgress(currentProgress);

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        // Add a slight delay at 100% for an organic visual lock-in feel before resolving
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] bg-[#ffffff] flex flex-col items-center justify-between py-16 px-6 select-none"
    >
      {/* Decorative Warm Soft Background Glow - subtle and elegant */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,90,64,0.02)_0%,transparent_70%)] pointer-events-none" />

      {/* Top spacer */}
      <div className="h-10" />

      {/* Center content */}
      <div className="flex flex-col items-center justify-center gap-8 max-w-sm md:max-w-lg text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            y: [0, -12, 0], 
            scale: 1,
            rotate: [0, -1, 1, 0]
          }}
          transition={{
            y: {
              repeat: Infinity,
              repeatType: "mirror",
              duration: 2.2,
              ease: "easeInOut"
            },
            rotate: {
              repeat: Infinity,
              repeatType: "mirror",
              duration: 4.5,
              ease: "easeInOut"
            },
            opacity: { duration: 0.6, ease: "easeOut" },
            scale: { duration: 0.6, ease: "easeOut" }
          }}
          className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 drop-shadow-[0_16px_36px_rgba(90,90,64,0.12)] bg-white/50 rounded-full"
        >
          {logoUrl ? (
            <img 
               src={logoUrl} 
              alt="আহরোণ" 
              className="h-full w-full object-contain p-2 filter brightness-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="font-logo text-5xl md:text-6xl text-[#005900] logo-text select-none">
                আহরোণ
              </span>
            </div>
          )}
        </motion.div>

        {/* Brand Text & Welcome Intro */}
        <div className="space-y-3 mt-4 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl md:text-5xl font-black font-sans tracking-tight text-[#2D2D1B] leading-none"
          >
            আহরোণ
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm md:text-lg text-[#5A5A40] font-sans font-bold tracking-wide leading-relaxed"
          >
            বাংলার ঐতিহ্যবাহী ভেজালমুক্ত স্বাদের আনন্দযাত্রা
          </motion.p>
        </div>
      </div>

      {/* Bottom Loading Progress bar and Credit Info */}
      <div className="w-full max-w-[260px] md:max-w-xs flex flex-col items-center gap-5 z-10 pb-4">
        <div className="w-full h-1.5 bg-[#5A5A40]/10 rounded-full overflow-hidden relative shadow-inner">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#005900] to-[#5A5A40] rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-xs md:text-sm font-mono font-bold tracking-widest text-[#5A5A40]/70 uppercase"
        >
          অনুগ্রহ করে অপেক্ষা করুন... {Math.round(progress)}%
        </motion.span>
      </div>
    </motion.div>
  );
};
