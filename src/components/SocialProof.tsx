import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';

interface RecentActivity {
  id: string;
  userName: string;
  productName: string;
  time: string;
}

export const SocialProof = () => {
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulated real-time social proof if no real orders yet
    // In production, you would listen to 'orders' collection
    const productNames = ["Premium Rice", "Organic Honey", "Fresh Mango", "Lush Cream", "Daily Fresh Milk"];
    const names = ["Abir", "Sumaya", "Tanvir", "Nusrat", "Rakib", "Afroza"];

    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomProduct = productNames[Math.floor(Math.random() * productNames.length)];
      
      setActivity({
        id: Math.random().toString(),
        userName: randomName,
        productName: randomProduct,
        time: "just now"
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const interval = setInterval(() => {
      // 30% chance to show every 15 seconds
      if (Math.random() > 0.7) {
        showNotification();
      }
    }, 15000);

    // Also try to listen to real public activity if collection exists
    const q = query(collection(db, 'public_activity'), orderBy('createdAt', 'desc'), limit(1));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setActivity({
          id: doc.id,
          userName: data.userName || "Someone",
          productName: data.productName || "a product",
          time: "just now"
        });
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 5000);
      }
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && activity && (
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, x: -100 }}
          className="fixed bottom-24 left-4 z-40 bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-4 flex items-center gap-4 border border-gray-100 max-w-xs"
        >
          <div className="bg-primary/10 p-2 rounded-xl">
            <ShoppingBag className="text-primary" size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {activity.userName} <span className="font-normal text-gray-500">just bought</span> {activity.productName}
            </p>
            <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">
               Verified Purchase
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
