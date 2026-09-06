import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Star, Instagram as InstagramIcon, ShoppingBag, Heart, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { ProductGrid } from '../components/ProductGrid';
import { PromotionalPopup } from '../components/PromotionalPopup';
import { Category, Product, Offer, InstagramPost, Review } from '../types';
import {
  getCategories,
  getProducts,
  getOffers,
  getInstagramPosts,
  getReviews,
} from '../firebase/services';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods, offs, instas, revs] = await Promise.all([
          getCategories(),
          getProducts(),
          getOffers(),
          getInstagramPosts(),
          getReviews(true),
        ]);
        setCategories(cats.filter((c) => c.isActive));
        setProducts(prods.filter((p) => p.isActive));
        setOffers(offs.filter((o) => o.isActive));
        setInstagramPosts(instas.filter((i) => i.isActive));
        setReviews(revs);
      } catch (err) {
        console.warn('Home page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);

  return (
    <div className="space-y-12 pb-12">
      {/* Dynamic Hero Banner */}
      <HeroBanner />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Collections</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy">Shop by Category</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-burgundy hover:text-gold transition-colors flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gold-200/60 p-3 text-center shadow-sm hover:shadow-luxury hover:border-gold transition-all duration-300 flex flex-col items-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 bg-ivory border-2 border-gold/30 group-hover:border-gold group-hover:scale-105 transition-all">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-semibold text-charcoal group-hover:text-burgundy transition-colors line-clamp-1">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Curated Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy">Best Sellers</h2>
          </div>
          <Link
            to="/shop?filter=best-sellers"
            className="text-xs font-bold text-burgundy hover:text-gold transition-colors flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={bestSellers.length > 0 ? bestSellers : products.slice(0, 4)} loading={loading} />
      </section>

      {/* Special Offers Banner Highlight */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-burgundy text-white p-8 md:p-12 border-2 border-gold/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="inline-block bg-gold text-burgundy text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {offers[0].discount || 'FESTIVE OFFER'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ivory">
                {offers[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-ivory-dark font-sans leading-relaxed">
                {offers[0].description}
              </p>
              {offers[0].couponText && (
                <div className="inline-flex items-center space-x-2 bg-burgundy-900/80 border border-gold/40 px-4 py-2 rounded-xl text-xs">
                  <span className="text-gray-300">Use Code:</span>
                  <span className="font-mono font-bold text-gold text-sm tracking-wider">{offers[0].couponText}</span>
                </div>
              )}
              <div className="pt-2">
                <Link
                  to={offers[0].ctaLink || '/shop'}
                  className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-burgundy font-bold text-xs py-3 px-6 rounded-full shadow hover:shadow-gold-glow transition-all uppercase tracking-wider"
                >
                  <span>{offers[0].ctaText || 'Claim Offer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {offers[0].bannerImage && (
              <div className="w-full md:w-1/2 aspect-video md:aspect-square max-h-72 rounded-2xl overflow-hidden border border-gold/30">
                <img
                  src={offers[0].bannerImage}
                  alt={offers[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-gold tracking-widest uppercase">Freshly Crafted</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy">New Arrivals</h2>
          </div>
          <Link
            to="/shop?filter=new-arrivals"
            className="text-xs font-bold text-burgundy hover:text-gold transition-colors flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={newArrivals.length > 0 ? newArrivals : products.slice(0, 4)} loading={loading} />
      </section>

      {/* Customer Reviews Section */}
      {reviews.length > 0 && (
        <section className="bg-ivory-dark/40 py-12 border-y border-gold-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-semibold text-gold tracking-widest uppercase">Love From Customers</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy mt-1">What Our Clients Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    {rev.title && (
                      <h4 className="font-serif font-bold text-charcoal text-sm">{rev.title}</h4>
                    )}
                    <p className="text-xs text-charcoal-muted leading-relaxed font-sans italic">
                      "{rev.text}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t border-ivory">
                    {rev.customerImage ? (
                      <img src={rev.customerImage} alt={rev.customerName} className="w-9 h-9 rounded-full object-cover border border-gold" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-burgundy text-gold flex items-center justify-center font-bold text-xs">
                        {rev.customerName[0]}
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs font-semibold text-charcoal">{rev.customerName}</h5>
                      <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Grid Section */}
      {instagramPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center space-x-1.5 text-burgundy font-bold text-xs uppercase tracking-wider mb-1">
              <InstagramIcon className="w-4 h-4 text-gold" />
              <span>@sovikjewels</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy">Follow Us On Instagram</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={post.postUrl || 'https://instagram.com/sovikjewels'}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden border border-gold-200 shadow-sm"
              >
                <img
                  src={post.image}
                  alt="Instagram post"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-burgundy/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                  <InstagramIcon className="w-6 h-6 text-gold" />
                  <p className="text-[11px] line-clamp-2 text-ivory font-sans">{post.caption}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Promotional Popup trigger component */}
      <PromotionalPopup />
    </div>
  );
};
