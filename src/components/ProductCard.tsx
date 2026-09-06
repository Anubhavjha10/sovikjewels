import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, MessageCircle, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import {
  formatCurrency,
  generateWhatsAppInquiryMessage,
  createWhatsAppLink,
} from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600';
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const productUrl = `${window.location.origin}/product/${product.slug}`;

  const handleWhatsAppBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const message = generateWhatsAppInquiryMessage(
      product.name,
      product.sku,
      product.price,
      1,
      productUrl,
      settings.productInquiryTemplate
    );

    const whatsappUrl = createWhatsAppLink(settings.whatsappNumber, message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Sovik Jewels`,
          text: `Check out ${product.name} on Sovik Jewels - ${formatCurrency(product.price)}`,
          url: productUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy product URL:', err);
    }
  };

  return (
    <div className="group relative bg-white border border-gold-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-luxury hover:border-gold transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-ivory">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.discount > 0 && (
            <span className="bg-burgundy text-gold-light text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              {product.discount}% OFF
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-gold text-burgundy text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-charcoal text-ivory text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              Best Seller
            </span>
          )}
        </div>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
            Only {product.stock} left
          </span>
        ) : null}

        {/* Top Right Quick Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow ${
              isWishlisted
                ? 'bg-burgundy text-gold'
                : 'bg-white/80 text-charcoal hover:bg-white hover:text-burgundy'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-gold' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 text-charcoal hover:bg-white hover:text-burgundy backdrop-blur-md transition-all shadow"
            title="Share Product"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <span className="text-[11px] font-medium text-gold-700 tracking-wider uppercase">
            {product.categoryName}
          </span>

          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-serif font-semibold text-charcoal hover:text-burgundy transition-colors line-clamp-1 mt-0.5">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-charcoal-muted line-clamp-2 mt-1 font-sans">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-ivory-dark flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-burgundy">
              {formatCurrency(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>

          {/* Buy Now WhatsApp Button */}
          <button
            onClick={handleWhatsAppBuyNow}
            disabled={isOutOfStock}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
