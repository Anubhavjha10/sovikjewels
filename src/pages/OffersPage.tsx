import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Clock, ArrowRight, Copy, Check } from 'lucide-react';
import { Offer } from '../types';
import { getOffers } from '../firebase/services';
import { formatDate } from '../utils/formatters';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await getOffers();
        // Filter out inactive or expired offers automatically
        const now = new Date().toISOString().split('T')[0];
        const activeOffers = data.filter((o) => {
          if (!o.isActive) return false;
          if (o.endDate && o.endDate < now) return false;
          return true;
        });
        setOffers(activeOffers);
      } catch (err) {
        console.warn('Offers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-burgundy text-white p-8 rounded-3xl border border-gold/30 shadow-xl text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-gold/20 text-gold-light border border-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          <Tag className="w-3.5 h-3.5" />
          <span>Exclusive Promotions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
          Jewellery Offers & Coupons
        </h1>
        <p className="text-xs sm:text-sm text-ivory-dark font-sans leading-relaxed">
          Claim limited-time festive discounts and special WhatsApp order promo codes on our luxury collections.
        </p>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 skeleton-shimmer rounded-2xl" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gold-200 shadow-sm space-y-3">
          <Sparkles className="w-8 h-8 text-gold mx-auto" />
          <h3 className="font-serif font-bold text-burgundy text-xl">No active offers right now</h3>
          <p className="text-xs text-charcoal-muted">Check back soon or explore our everyday best value jewellery.</p>
          <Link
            to="/shop"
            className="inline-block bg-burgundy text-gold-light text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider mt-2"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-3xl overflow-hidden border border-gold-300 shadow-md hover:shadow-luxury transition-all duration-300 flex flex-col justify-between"
            >
              {/* Banner Image */}
              {offer.bannerImage && (
                <div className="aspect-[21/9] bg-ivory relative overflow-hidden">
                  <img src={offer.bannerImage} alt={offer.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-burgundy text-gold-light text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                    {offer.discount}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-burgundy">{offer.title}</h3>
                  <p className="text-xs text-charcoal-muted mt-2 leading-relaxed font-sans">{offer.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-ivory">
                  {/* Coupon Code box */}
                  {offer.couponText && (
                    <div className="flex items-center justify-between bg-ivory border border-dashed border-gold-400 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Promo Code</span>
                        <span className="font-mono font-bold text-burgundy text-sm tracking-wider">{offer.couponText}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCoupon(offer.couponText!)}
                        className="flex items-center space-x-1 text-xs text-burgundy hover:text-gold font-semibold bg-white border border-gold-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedCode === offer.couponText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Validity */}
                  {offer.endDate && (
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-gold-700" />
                      <span>Valid until: {formatDate(offer.endDate)}</span>
                    </div>
                  )}

                  <Link
                    to={offer.ctaLink || '/shop'}
                    className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow uppercase tracking-wider"
                  >
                    <span>{offer.ctaText || 'Shop Collection'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
