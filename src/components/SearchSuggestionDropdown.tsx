import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, PackageX, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getProducts } from '../firebase/services';
import { formatCurrency } from '../utils/formatters';

interface SearchSuggestionDropdownProps {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: () => void;
}

const CATEGORY_SHORTCUTS = ['Necklaces', 'Earrings', 'Rings', 'Bangles', 'Watches'];

export const SearchSuggestionDropdown: React.FC<SearchSuggestionDropdownProps> = ({
  searchQuery,
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch products catalogue for client-side fast debounced search
  useEffect(() => {
    let isMounted = true;
    const fetchProds = async () => {
      try {
        const prods = await getProducts();
        if (isMounted) {
          setAllProducts(prods.filter((p) => p.isActive));
        }
      } catch (err) {
        console.warn('Failed to load products for search:', err);
      }
    };
    fetchProds();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products when searchQuery changes (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchingProducts([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const q = searchQuery.trim().toLowerCase();
      const results = allProducts.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const categoryMatch = p.categoryName.toLowerCase().includes(q);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
        return nameMatch || skuMatch || categoryMatch || tagMatch;
      });
      setMatchingProducts(results.slice(0, 6)); // Top 6 quick results
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !searchQuery.trim()) return null;

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    onSelectProduct();
    onClose();
  };

  const handleViewAll = () => {
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    onSelectProduct();
    onClose();
  };

  const handleCategoryShortcutClick = (catName: string) => {
    navigate(`/shop?search=${encodeURIComponent(catName)}`);
    onSelectProduct();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gold-300 shadow-2xl overflow-hidden z-50 animate-fade-in font-sans text-xs"
    >
      {/* Dropdown Header */}
      <div className="bg-ivory/80 px-4 py-2.5 border-b border-gold-200 flex items-center justify-between">
        <span className="text-[11px] text-charcoal-muted font-medium">
          Search results for "<strong className="text-burgundy">{searchQuery}</strong>"
        </span>
        {loading && <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />}
      </div>

      {/* Suggestion Items List */}
      {loading ? (
        <div className="p-6 text-center text-charcoal-muted space-y-2">
          <Loader2 className="w-6 h-6 text-gold animate-spin mx-auto" />
          <p className="text-[11px]">Searching Sovik Jewels catalogue...</p>
        </div>
      ) : matchingProducts.length > 0 ? (
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {matchingProducts.map((p) => {
            const hasDiscount = p.mrp > p.price;
            const discountPct = hasDiscount
              ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
              : 0;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProductClick(p.slug)}
                className="w-full p-3 flex items-center space-x-3 text-left hover:bg-ivory/80 transition-colors group"
              >
                <img
                  src={
                    p.images?.[0] ||
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gold-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-charcoal text-xs truncate group-hover:text-burgundy transition-colors">
                    {p.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[10px] text-gray-400 font-mono">SKU: {p.sku}</span>
                    <span className="text-[10px] text-gold-700 font-semibold">• {p.categoryName}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-bold text-burgundy text-xs block">
                    {formatCurrency(p.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 text-center space-y-3">
          <PackageX className="w-8 h-8 text-gold mx-auto" />
          <div>
            <p className="font-semibold text-burgundy text-xs">No matching products found</p>
            <p className="text-[11px] text-charcoal-muted mt-0.5">
              Try searching by collection, material, or category name.
            </p>
          </div>

          <div className="pt-2 border-t border-ivory">
            <span className="text-[10px] text-gray-400 font-medium block mb-2 uppercase tracking-wider">
              Try searching for:
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {CATEGORY_SHORTCUTS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryShortcutClick(cat)}
                  className="text-[11px] bg-ivory hover:bg-gold hover:text-burgundy text-charcoal px-2.5 py-1 rounded-full font-medium transition-colors border border-gold-200"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer View All Link */}
      {matchingProducts.length > 0 && (
        <button
          type="button"
          onClick={handleViewAll}
          className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-4 flex items-center justify-center space-x-2 border-t border-gold/30 transition-colors uppercase tracking-wider"
        >
          <span>View all results for "{searchQuery}"</span>
          <ArrowRight className="w-4 h-4 text-gold" />
        </button>
      )}
    </div>
  );
};
