import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { ProductCard } from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link to="/" className="text-primary font-bold hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
