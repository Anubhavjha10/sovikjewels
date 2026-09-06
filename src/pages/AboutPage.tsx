import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Award, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="bg-burgundy text-white p-8 md:p-14 rounded-3xl border border-gold/40 shadow-xl text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-1.5 bg-gold/20 text-gold-light border border-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Heritage & Craftsmanship</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ivory">
          About Sovik Jewels
        </h1>
        <p className="text-xs sm:text-sm text-ivory-dark font-sans max-w-2xl mx-auto leading-relaxed">
          Crafting artificial jewellery that reflects the timeless grandeur of royal Indian heritage, blended with modern contemporary chic.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-gold-200/60 shadow-sm">
        <div className="space-y-4">
          <span className="text-xs font-bold text-gold tracking-widest uppercase">The Essence</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-burgundy">
            A Passion for Perfection & Grace
          </h2>
          <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
            At Sovik Jewels, we believe every woman deserves to experience the radiance of fine jewellery without compromise. Founded with a vision to redefine fashion jewellery, each piece in our collection is carefully curated and hand-inspected for exceptional finish, sparkle, and anti-tarnish longevity.
          </p>
          <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
            From intricate Kundan chokers and regal bridal sets to lightweight rose gold studs and sleek fashion timepieces, our designs bring elegance to every celebration.
          </p>
        </div>

        <div className="aspect-square rounded-2xl overflow-hidden border-2 border-gold-300 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"
            alt="Jewellery Craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Pillars of Excellence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gold-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-ivory text-gold flex items-center justify-center mx-auto border border-gold-300">
            <Award className="w-6 h-6 text-burgundy" />
          </div>
          <h3 className="font-serif font-bold text-burgundy text-lg">Superior Finish</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            High-grade gold plating and micro-pave stone setting that mimics real gold jewellery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gold-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-ivory text-gold flex items-center justify-center mx-auto border border-gold-300">
            <ShieldCheck className="w-6 h-6 text-burgundy" />
          </div>
          <h3 className="font-serif font-bold text-burgundy text-lg">Skin Friendly</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Nickel-free, lead-free and anti-allergic materials for comfortable all-day wear.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gold-200 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-ivory text-gold flex items-center justify-center mx-auto border border-gold-300">
            <Heart className="w-6 h-6 text-burgundy" />
          </div>
          <h3 className="font-serif font-bold text-burgundy text-lg">WhatsApp First</h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Seamless order inquiries and personalized assistance straight through WhatsApp.
          </p>
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-burgundy text-white p-8 rounded-3xl text-center space-y-4 border border-gold/30">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory">Explore Our Royal Collections</h2>
        <p className="text-xs text-ivory-dark max-w-md mx-auto">
          Elevate your wardrobe with statement pieces designed to turn heads.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 bg-gold hover:bg-gold-dark text-burgundy font-bold text-xs px-6 py-3 rounded-full uppercase tracking-wider shadow"
        >
          <span>Shop Collection</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
