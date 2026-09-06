import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { createWhatsAppLink } from '../utils/formatters';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const handleWhatsApp = () => {
    const link = createWhatsAppLink(
      settings.whatsappNumber,
      'Hello Sovik Jewels! I am reaching out from your website footer.'
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-burgundy-950 text-ivory pt-12 pb-24 md:pb-12 border-t-2 border-gold/40 mt-16">
      {/* Brand Values Highlights Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-burgundy-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-3">
            <div className="p-2.5 rounded-full bg-gold/10 text-gold border border-gold/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gold-light uppercase tracking-wider">Premium Polish</h4>
              <p className="text-[11px] text-gray-300 mt-0.5">High grade anti-tarnish finish</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-3">
            <div className="p-2.5 rounded-full bg-gold/10 text-gold border border-gold/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gold-light uppercase tracking-wider">Fast Delivery</h4>
              <p className="text-[11px] text-gray-300 mt-0.5">Insured shipping across India</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-3">
            <div className="p-2.5 rounded-full bg-gold/10 text-gold border border-gold/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gold-light uppercase tracking-wider">Direct WhatsApp</h4>
              <p className="text-[11px] text-gray-300 mt-0.5">Instant order & customer help</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-3">
            <div className="p-2.5 rounded-full bg-gold/10 text-gold border border-gold/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gold-light uppercase tracking-wider">Quality Assurance</h4>
              <p className="text-[11px] text-gray-300 mt-0.5">Checked for craft perfection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-burgundy border border-gold flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-gold">S</span>
            </div>
            <span className="font-serif text-2xl font-bold text-ivory">
              Sovik <span className="gold-gradient-text">Jewels</span>
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            {settings.footerDescription}
          </p>
          <div className="flex items-center space-x-3 pt-2">
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-burgundy-900 text-gold hover:bg-gold hover:text-burgundy transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-burgundy-900 text-gold hover:bg-gold hover:text-burgundy transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-burgundy-900 text-gold hover:bg-gold hover:text-burgundy transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-serif font-semibold text-gold tracking-wider uppercase border-b border-burgundy-800 pb-2">
            Quick Navigation
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li>
              <Link to="/shop" className="hover:text-gold transition-colors">
                Browse Shop
              </Link>
            </li>
            <li>
              <Link to="/offers" className="hover:text-gold transition-colors">
                Special Offers & Discounts
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-gold transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-gold transition-colors">
                My Wishlist
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold transition-colors">
                About Sovik Jewels
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold transition-colors">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-serif font-semibold text-gold tracking-wider uppercase border-b border-burgundy-800 pb-2">
            Top Categories
          </h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li>
              <Link to="/category/necklaces" className="hover:text-gold transition-colors">
                Royal Kundan Necklaces
              </Link>
            </li>
            <li>
              <Link to="/category/earrings" className="hover:text-gold transition-colors">
                Statement Jhumkas & Earrings
              </Link>
            </li>
            <li>
              <Link to="/category/jewellery-sets" className="hover:text-gold transition-colors">
                Bridal Jewellery Sets
              </Link>
            </li>
            <li>
              <Link to="/category/watches" className="hover:text-gold transition-colors">
                Rose Gold Watches
              </Link>
            </li>
            <li>
              <Link to="/category/rings" className="hover:text-gold transition-colors">
                Solitaire Cocktail Rings
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-serif font-semibold text-gold tracking-wider uppercase border-b border-burgundy-800 pb-2">
            Boutique Contact
          </h3>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" />
              <a href={`tel:${settings.contactMobile}`} className="hover:text-gold">
                {settings.contactMobile}
              </a>
            </li>
            <li className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-gold flex-shrink-0" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-gold">
                {settings.contactEmail}
              </a>
            </li>
            <li className="pt-2">
              <button
                onClick={handleWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Commerce</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-burgundy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <p>{settings.copyrightText}</p>
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="hover:text-gold transition-colors font-medium">
            Admin CMS Login
          </Link>
          <span>•</span>
          <Link to="/track-order" className="hover:text-gold transition-colors">
            Order Status
          </Link>
        </div>
      </div>
    </footer>
  );
};
