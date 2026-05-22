import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface LoyaltyData {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  lifetimeSpent: number;
}

interface LoyaltyContextType {
  loyalty: LoyaltyData;
  addPoints: (amount: number) => Promise<void>;
  redeemPoints: (amount: number) => Promise<boolean>;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const LoyaltyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loyalty, setLoyalty] = useState<LoyaltyData>({
    points: 0,
    tier: 'Bronze',
    lifetimeSpent: 0
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubSession = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setLoyalty({
              points: data.points || 0,
              tier: data.tier || 'Bronze',
              lifetimeSpent: data.lifetimeSpent || 0
            });
          } else {
            // Initialize user data if doesn't exist
            setDoc(userRef, {
              email: user.email || '',
              points: 0,
              tier: 'Bronze',
              lifetimeSpent: 0,
              role: 'viewer',
              createdAt: serverTimestamp()
            });
          }
        });
        return unsubSession;
      } else {
        // Reset for guest
        setLoyalty({ points: 0, tier: 'Bronze', lifetimeSpent: 0 });
      }
    });

    return unsub;
  }, []);

  const addPoints = async (points: number) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const newPoints = loyalty.points + points;
    
    // Simple tier calculation
    let newTier = loyalty.tier;
    if (loyalty.lifetimeSpent > 50000) newTier = 'Platinum';
    else if (loyalty.lifetimeSpent > 20000) newTier = 'Gold';
    else if (loyalty.lifetimeSpent > 5000) newTier = 'Silver';

    await updateDoc(userRef, {
      points: newPoints,
      tier: newTier
    });
  };

  const redeemPoints = async (amount: number) => {
    const user = auth.currentUser;
    if (!user || loyalty.points < amount) return false;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: loyalty.points - amount
    });
    return true;
  };

  return (
    <LoyaltyContext.Provider value={{ loyalty, addPoints, redeemPoints }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider');
  }
  return context;
};
