import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { Product } from '../types';

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

export const WishlistButton = ({ product, className = '' }: WishlistButtonProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      className={`p-2 rounded-full transition-colors ${
        isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
      } ${className}`}
    >
      <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
    </button>
  );
};
