import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Banner } from '../types';
import { getBanners } from '../firebase/services';

export const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const fetched = await getBanners();
        const active = fetched.filter((b) => b.isActive);
        setBanners(active.length > 0 ? active : []);
      } catch (err) {
        console.warn('Hero banner load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] min-h-[360px] skeleton-shimmer rounded-2xl my-4 max-w-7xl mx-auto" />
    );
  }

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 md:my-6">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow- luxury bg-burgundy min-h-[380px] md:min-h-[460px] flex items-center">
        {/* Banner Images (Desktop & Mobile) */}
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 768px)" srcSet={currentBanner.mobileImage || currentBanner.desktopImage} />
          <img
            src={currentBanner.desktopImage}
            alt={currentBanner.heading}
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-1000"
          />
        </picture>

        {/* Gradient Overlay for Readable Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/90 via-burgundy-900/60 to-transparent" />

        {/* Banner Text Overlay */}
        <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-xl text-white space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold/20 backdrop-blur-md text-gold-light border border-gold/40 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Exclusive Collection</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-ivory leading-tight drop-shadow-md">
            {currentBanner.heading}
          </h1>

          {currentBanner.description && (
            <p className="text-xs sm:text-sm md:text-base text-ivory-dark font-sans max-w-md line-clamp-3">
              {currentBanner.description}
            </p>
          )}

          <div className="pt-2">
            <Link
              to={currentBanner.buttonLink || '/shop'}
              className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-burgundy font-bold text-xs sm:text-sm py-3 px-6 rounded-full shadow-lg hover:shadow-gold-glow transition-all uppercase tracking-wider"
            >
              <span>{currentBanner.buttonText || 'EXPLORE NOW'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute left-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hidden sm:block"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hidden sm:block"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-gold w-7' : 'bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
