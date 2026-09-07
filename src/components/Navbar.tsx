import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, MessageCircle, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { createWhatsAppLink } from '../utils/formatters';
import { SearchSuggestionDropdown } from './SearchSuggestionDropdown';

export const Navbar: React.FC = () => {
  const { wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleWhatsAppClick = () => {
    const link = createWhatsAppLink(
      settings.whatsappNumber,
      'Hello Sovik Jewels! I am looking for assistance regarding jewellery collections.'
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Top Banner Announcement */}
      <div className="bg-burgundy text-gold-light text-xs font-medium py-1.5 px-4 text-center border-b border-gold-400/20 flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
        <span>Complimentary Gift Box on all WhatsApp Orders above ₹1,499!</span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gold-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile Hamburger & Search trigger */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-charcoal hover:text-burgundy focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-charcoal hover:text-burgundy"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-burgundy flex items-center justify-center border border-gold shadow-sm group-hover:shadow-gold-glow transition-all">
                <span className="font-serif text-lg font-bold text-gold">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-burgundy group-hover:text-burgundy-700 transition-colors">
                  Sovik <span className="gold-gradient-text">Jewels</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-gold-700 -mt-1">
                  Luxury Boutique
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 ${
                  isActive('/') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 ${
                  isActive('/shop') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/offers"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 flex items-center space-x-1 ${
                  isActive('/offers') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                <span>Offers</span>
                <span className="bg-gold/20 text-burgundy text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  HOT
                </span>
              </Link>
              <Link
                to="/track-order"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 ${
                  isActive('/track-order') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                Track Order
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 ${
                  isActive('/about') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium transition-colors hover:text-burgundy relative py-1 ${
                  isActive('/contact') ? 'text-burgundy font-semibold border-b-2 border-gold' : 'text-charcoal-light'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Desktop Right Utilities */}
            <div className="flex items-center space-x-4">
              {/* Desktop / Tablet Search Bar */}
              <div className="hidden md:block relative">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search jewellery, SKU..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    className="w-40 lg:w-48 xl:w-60 text-xs pl-9 pr-3 py-2 bg-ivory rounded-full border border-gold-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                  <Search className="w-4 h-4 text-gold-700 absolute left-3 pointer-events-none" />
                </form>

                {/* Live Search Suggestion Dropdown */}
                <SearchSuggestionDropdown
                  searchQuery={searchQuery}
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  onSelectProduct={() => setSearchQuery('')}
                />
              </div>

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-charcoal hover:text-burgundy transition-colors rounded-full hover:bg-ivory"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-burgundy text-gold-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* WhatsApp Business Action Button */}
              <button
                onClick={handleWhatsAppClick}
                className="hidden sm:flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow hover:shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {searchOpen && (
          <div className="p-3 bg-ivory border-t border-gold-200 md:hidden animate-fade-in relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search neckpieces, rings, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-xs pl-9 pr-8 py-2.5 bg-white rounded-lg border border-gold-300 focus:outline-none focus:border-gold"
              />
              <Search className="w-4 h-4 text-gold-700 absolute left-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-2.5 p-1 text-gray-400 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <SearchSuggestionDropdown
              searchQuery={searchQuery}
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              onSelectProduct={() => setSearchQuery('')}
            />
          </div>
        )}
      </header>

      {/* Mobile Side Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-fade-in">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-ivory-dark">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center border border-gold">
                    <span className="font-serif font-bold text-gold">S</span>
                  </div>
                  <span className="font-serif text-xl font-bold text-burgundy">
                    Sovik Jewels
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-charcoal hover:text-burgundy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50"
                >
                  Shop Collection
                </Link>
                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50 flex items-center justify-between"
                >
                  <span>Special Offers</span>
                  <span className="bg-gold text-burgundy text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Exclusive
                  </span>
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50"
                >
                  Track Order
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50 flex items-center justify-between"
                >
                  <span>My Wishlist</span>
                  <span className="bg-burgundy text-gold text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50"
                >
                  About Our Brand
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-serif font-medium text-charcoal hover:text-burgundy py-2 border-b border-gray-50"
                >
                  Contact & Support
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-ivory-dark space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWhatsAppClick();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp</span>
              </button>

              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs text-gray-400 hover:text-burgundy font-medium"
              >
                Staff Admin Login →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
