import { useState, useEffect } from 'react';
import { Product } from '../types';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const addToWishlist = (product: Product) => {
    const newWishlist = [...wishlist, product];
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const removeFromWishlist = (id: string) => {
    const newWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const isInWishlist = (id: string) => {
    return wishlist.some(item => item.id === id);
  };

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist };
}
