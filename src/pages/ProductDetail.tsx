import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  MessageCircle,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Star,
} from 'lucide-react';
import { Product } from '../types';
import { getProductBySlug, getProducts } from '../firebase/services';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { ProductGrid } from '../components/ProductGrid';
import {
  formatCurrency,
  generateWhatsAppInquiryMessage,
  createWhatsAppLink,
} from '../utils/formatters';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);

        if (prod) {
          setSelectedImage(prod.images?.[0] || '');
          const allProds = await getProducts();
          const related = allProds.filter(
            (p) => p.id !== prod.id && p.categoryId === prod.categoryId && p.isActive
          );
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (err) {
        console.warn('Product detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square skeleton-shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton-shimmer w-3/4 rounded" />
            <div className="h-4 skeleton-shimmer w-1/4 rounded" />
            <div className="h-10 skeleton-shimmer w-1/2 rounded" />
            <div className="h-24 skeleton-shimmer w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-burgundy">Product Not Found</h2>
        <p className="text-xs text-charcoal-muted">
          The piece you are looking for is no longer available or URL is invalid.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-burgundy text-gold-light text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider"
        >
          Return to Boutique
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const productUrl = window.location.href;

  const handleBuyNowWhatsApp = () => {
    if (isOutOfStock) return;
    const message = generateWhatsAppInquiryMessage(
      product.name,
      product.sku,
      product.price,
      quantity,
      productUrl,
      settings.productInquiryTemplate
    );
    const whatsappUrl = createWhatsAppLink(settings.whatsappNumber, message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Sovik Jewels`,
          text: `Check out ${product.name} - ${formatCurrency(product.price)}`,
          url: productUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-burgundy">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-burgundy">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/category/${product.categoryId}`} className="hover:text-burgundy">
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-burgundy font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gold-300 shadow-md">
            <img
              src={selectedImage || product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-burgundy text-gold-light text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img ? 'border-burgundy ring-2 ring-gold' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Buy Now */}
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-gold-200/60 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gold-700 tracking-widest uppercase">
                {product.categoryName}
              </span>
              <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy mt-1">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs text-charcoal-muted font-medium">(4.9/5 Rating)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-ivory p-4 rounded-xl border border-gold-200 flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-burgundy">
              {formatCurrency(product.price * quantity)}
            </span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.mrp * quantity)}
              </span>
            )}
            {product.discount > 0 && (
              <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <span className="inline-block bg-red-100 text-red-800 font-bold text-xs px-3 py-1 rounded-full uppercase">
                🔴 Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-block bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full">
                🟠 Low Stock — Only {product.stock} left in boutique
              </span>
            ) : (
              <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">
                🟢 In Stock & Ready to Dispatch
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center space-x-4">
              <span className="text-xs font-semibold text-charcoal uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center border border-gold-300 rounded-lg overflow-hidden bg-ivory">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-burgundy hover:bg-gold-200 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold text-burgundy">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 text-burgundy hover:bg-gold-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons: Buy Now on WhatsApp, Wishlist, Share */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleBuyNowWhatsApp}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-3 shadow-lg transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-xl'
              }`}
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span className="uppercase tracking-wider">
                {isOutOfStock ? 'Out of Stock' : 'Buy Now on WhatsApp'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleWishlist(product)}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                  isWishlisted
                    ? 'bg-burgundy text-gold border-burgundy'
                    : 'bg-ivory text-charcoal hover:bg-white border-gold-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-gold' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 bg-ivory hover:bg-white text-charcoal border border-gold-300 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Share Product'}</span>
              </button>
            </div>
          </div>

          {/* Product Description */}
          <div className="pt-4 border-t border-ivory-dark space-y-2">
            <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
              Product Details & Description
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-sans whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-ivory text-burgundy border border-gold-200 px-2.5 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-ivory text-center">
            <div className="p-2 space-y-1">
              <ShieldCheck className="w-5 h-5 text-gold mx-auto" />
              <span className="text-[10px] text-charcoal font-medium block">100% Quality Checked</span>
            </div>
            <div className="p-2 space-y-1">
              <Truck className="w-5 h-5 text-gold mx-auto" />
              <span className="text-[10px] text-charcoal font-medium block">Safe Express Shipping</span>
            </div>
            <div className="p-2 space-y-1">
              <RotateCcw className="w-5 h-5 text-gold mx-auto" />
              <span className="text-[10px] text-charcoal font-medium block">Easy Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-gold-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-burgundy">You May Also Love</h2>
            <Link to="/shop" className="text-xs font-bold text-burgundy hover:text-gold uppercase tracking-wider">
              View Collection →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {/* STICKY MOBILE BUY NOW BUTTON NEAR BOTTOM */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-gold-300 shadow-2xl md:hidden">
        <button
          onClick={handleBuyNowWhatsApp}
          disabled={isOutOfStock}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white active:bg-emerald-700'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{isOutOfStock ? 'Out of Stock' : `BUY NOW ON WHATSAPP • ${formatCurrency(product.price * quantity)}`}</span>
        </button>
      </div>
    </div>
  );
};
