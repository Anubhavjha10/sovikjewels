import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-burgundy text-white p-8 rounded-3xl border border-gold/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gold tracking-widest uppercase">Saved Favourites</span>
          <h1 className="text-3xl font-serif font-bold text-ivory mt-1">My Jewellery Wishlist</h1>
          <p className="text-xs text-ivory-dark mt-1">
            {wishlistCount === 0 ? 'Your wishlist is currently empty.' : `You have ${wishlistCount} item(s) saved.`}
          </p>
        </div>

        {wishlistCount > 0 && (
          <button
            onClick={clearWishlist}
            className="flex items-center space-x-1.5 bg-burgundy-900 hover:bg-red-900 text-rose-200 text-xs font-medium px-4 py-2 rounded-xl border border-rose-400/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {wishlistCount === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gold-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-ivory text-gold flex items-center justify-center mx-auto border border-gold-300">
            <Heart className="w-8 h-8 text-burgundy" />
          </div>
          <h3 className="font-serif font-bold text-burgundy text-xl">No items in your wishlist</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Click the heart icon on any jewellery piece to save it here for later reference or WhatsApp ordering.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs px-6 py-3 rounded-full uppercase tracking-wider shadow"
          >
            <span>Explore Boutique</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
