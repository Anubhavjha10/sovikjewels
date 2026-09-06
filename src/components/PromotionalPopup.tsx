import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Popup } from '../types';
import { getPopups } from '../firebase/services';

export const PromotionalPopup: React.FC = () => {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('sovik_popup_dismissed');
    if (isDismissed) return;

    const fetchPopup = async () => {
      try {
        const popups = await getPopups();
        const activePopup = popups.find((p) => p.isActive);
        if (activePopup) {
          setPopup(activePopup);
          const delay = (activePopup.delaySeconds || 3) * 1000;
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, delay);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.warn('Popup fetch error:', err);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('sovik_popup_dismissed', 'true');
  };

  const handleAction = () => {
    handleClose();
    if (popup?.buttonUrl) {
      window.location.href = popup.buttonUrl;
    }
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border border-gold-300 transform transition-all">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 text-charcoal hover:text-burgundy rounded-full shadow hover:bg-white transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          {popup.image && (
            <div className="h-48 md:h-full min-h-[180px] bg-ivory relative overflow-hidden">
              <img
                src={popup.image}
                alt={popup.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy/40 to-transparent md:hidden" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 flex flex-col justify-between bg-white text-center md:text-left">
            <div>
              <div className="inline-flex items-center space-x-1 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Special Announcement</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-burgundy mb-2">
                {popup.title}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
                {popup.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-ivory-dark flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAction}
                className="flex-1 bg-burgundy hover:bg-burgundy-900 text-gold-light font-semibold text-xs py-2.5 px-4 rounded-xl shadow hover:shadow-gold-glow transition-all uppercase tracking-wider"
              >
                {popup.buttonText || 'SHOP NOW'}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2.5 text-xs text-charcoal-muted hover:text-burgundy transition-colors font-medium"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
