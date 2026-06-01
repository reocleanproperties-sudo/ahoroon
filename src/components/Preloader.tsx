import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminService } from '../services/adminService';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string>(
    localStorage.getItem('siteLogo') || ""
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Instantly attempt to load logo from firebase settings if not cached or to verify freshness
    adminService.getSettings()
      .then(settings => {
        if (settings && settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
          localStorage.setItem('siteLogo', settings.logoUrl);
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
      <div className="flex flex-col items-center justify-center gap-6 max-w-xs text-center z-10">
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
          className="relative flex items-center justify-center w-44 h-44 md:w-56 md:h-56 drop-shadow-[0_12px_30px_rgba(90,90,64,0.1)] bg-white/40 rounded-full"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="আহরোণ" 
              className="h-full w-full object-contain p-1 filter brightness-100"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="font-logo text-4xl text-[#005900] logo-text select-none">
                আহরোণ
              </span>
            </div>
          )}
        </motion.div>

        {/* Brand Text & Welcome Intro */}
        <div className="space-y-2 mt-4">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl md:text-2xl font-bold font-display text-[#2D2D1B]"
          >
            আহরোণ
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xs md:text-sm text-[#5A5A40] font-sans font-medium tracking-wide leading-relaxed"
          >
            বাংলার ঐতিহ্যবাহী ভেজালমুক্ত স্বাদের আনন্দযাত্রা
          </motion.p>
        </div>
      </div>

      {/* Bottom Loading Progress bar and Credit Info */}
      <div className="w-full max-w-[200px] flex flex-col items-center gap-4 z-10">
        <div className="w-full h-[3px] bg-[#5A5A40]/10 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#005900] to-[#5A5A40] rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-[#5A5A40]/60 uppercase"
        >
          অনুগ্রহ করে অপেক্ষা করুন... {Math.round(progress)}%
        </motion.span>
      </div>
    </motion.div>
  );
};
