import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Tag, Search, MessageCircle, Truck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { createWhatsAppLink } from '../utils/formatters';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { settings } = useSettings();

  const handleWhatsAppClick = () => {
    const link = createWhatsAppLink(
      settings.whatsappNumber,
      'Hello Sovik Jewels! I am interested in placing an order via WhatsApp.'
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gold-200 shadow-lg md:hidden">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/') ? 'text-burgundy font-bold' : 'text-charcoal-muted hover:text-burgundy'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/shop') ? 'text-burgundy font-bold' : 'text-charcoal-muted hover:text-burgundy'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Shop</span>
        </Link>

        <Link
          to="/offers"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
            isActive('/offers') ? 'text-burgundy font-bold' : 'text-charcoal-muted hover:text-burgundy'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px]">Offers</span>
          <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-gold animate-ping" />
        </Link>

        <Link
          to="/track-order"
          className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
            isActive('/track-order') ? 'text-burgundy font-bold' : 'text-charcoal-muted hover:text-burgundy'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Track</span>
        </Link>

        <button
          onClick={handleWhatsAppClick}
          className="flex flex-col items-center justify-center space-y-1 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="text-[10px]">WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
