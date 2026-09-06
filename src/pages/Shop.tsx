import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../firebase/services';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [specialFilter, setSpecialFilter] = useState<string>(initialFilter);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods.filter((p) => p.isActive));
        setCategories(cats.filter((c) => c.isActive));
      } catch (err) {
        console.warn('Shop data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update state when search params change
  useEffect(() => {
    if (searchParams.has('search')) {
      setSearchQuery(searchParams.get('search') || '');
    }
    if (searchParams.has('category')) {
      setSelectedCategory(searchParams.get('category') || 'all');
    }
    if (searchParams.has('filter')) {
      setSpecialFilter(searchParams.get('filter') || 'all');
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(q);
          const matchSku = product.sku.toLowerCase().includes(q);
          const matchCat = product.categoryName.toLowerCase().includes(q);
          const matchTags = product.tags?.some((t) => t.toLowerCase().includes(q));

          if (!matchName && !matchSku && !matchCat && !matchTags) return false;
        }

        // Category check
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory && product.categoryName.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Special filter check
        if (specialFilter === 'best-sellers' && !product.isBestSeller) return false;
        if (specialFilter === 'new-arrivals' && !product.isNewArrival) return false;
        if (specialFilter === 'offers' && !product.isOffer) return false;

        // Stock check
        if (inStockOnly && product.stock <= 0) return false;

        // Price range check
        if (priceRange === 'under-500' && product.price >= 500) return false;
        if (priceRange === '500-1000' && (product.price < 500 || product.price > 1000)) return false;
        if (priceRange === '1000-2000' && (product.price < 1000 || product.price > 2000)) return false;
        if (priceRange === 'above-2000' && product.price <= 2000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // featured default
      });
  }, [products, searchQuery, selectedCategory, specialFilter, priceRange, inStockOnly, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setInStockOnly(false);
    setSpecialFilter('all');
    setSortBy('featured');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="bg-burgundy text-white p-6 md:p-8 rounded-2xl border border-gold/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gold tracking-widest uppercase">Catalogue</span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-ivory mt-1">
            Shop Artificial Jewellery
          </h1>
          <p className="text-xs text-ivory-dark mt-1 font-sans">
            Handpicked neckpieces, earrings, rings & fashion timepieces crafted for luxury.
          </p>
        </div>

        {/* Search input in header */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-charcoal bg-white pl-9 pr-8 py-2.5 rounded-xl border border-gold-300 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-gold-700 absolute left-3 top-3 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-charcoal p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gold-200/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center space-x-2 bg-ivory text-burgundy text-xs font-semibold px-3 py-2 rounded-lg border border-gold-300"
          >
            <Filter className="w-4 h-4 text-gold" />
            <span>Filters</span>
          </button>

          <span className="text-xs text-charcoal-muted font-medium">
            Showing <strong className="text-burgundy">{filteredProducts.length}</strong> products
          </span>

          {(searchQuery || selectedCategory !== 'all' || priceRange !== 'all' || inStockOnly || specialFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-burgundy hover:text-gold font-medium underline transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-gold-700" />
          <span className="text-xs text-charcoal-muted font-medium hidden sm:inline">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-ivory border border-gold-200 rounded-lg px-3 py-2 text-charcoal font-medium focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between border-b border-ivory-dark pb-3">
            <h3 className="font-serif font-bold text-burgundy text-base">Filter Products</h3>
            <Filter className="w-4 h-4 text-gold" />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === 'all' ? 'bg-burgundy text-gold font-semibold' : 'text-charcoal-muted hover:bg-ivory'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] opacity-70">({products.length})</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id ? 'bg-burgundy text-gold font-semibold' : 'text-charcoal-muted hover:bg-ivory'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-3 border-t border-ivory">
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block">Price Range</label>
            <div className="space-y-1 text-xs">
              {[
                { label: 'All Prices', value: 'all' },
                { label: 'Under ₹500', value: 'under-500' },
                { label: '₹500 - ₹1,000', value: '500-1000' },
                { label: '₹1,000 - ₹2,000', value: '1000-2000' },
                { label: 'Above ₹2,000', value: 'above-2000' },
              ].map((p) => (
                <label key={p.value} className="flex items-center space-x-2 cursor-pointer hover:text-burgundy">
                  <input
                    type="radio"
                    name="priceRange"
                    value={p.value}
                    checked={priceRange === p.value}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="accent-burgundy"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Collections */}
          <div className="space-y-2 pt-3 border-t border-ivory">
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block">Special Highlights</label>
            <div className="space-y-1 text-xs">
              {[
                { label: 'All Items', value: 'all' },
                { label: 'Best Sellers', value: 'best-sellers' },
                { label: 'New Arrivals', value: 'new-arrivals' },
                { label: 'Special Offers', value: 'offers' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSpecialFilter(f.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                    specialFilter === f.value ? 'bg-gold/20 text-burgundy font-semibold' : 'text-charcoal-muted hover:bg-ivory'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-3 border-t border-ivory">
            <label className="flex items-center space-x-2 text-xs font-medium text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-burgundy rounded"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
            <div className="relative w-4/5 max-w-xs bg-white h-full p-6 shadow-xl flex flex-col justify-between z-10 overflow-y-auto space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-ivory">
                  <h3 className="font-serif font-bold text-burgundy text-base">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-charcoal" />
                  </button>
                </div>

                {/* Mobile Categories */}
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase block mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-ivory border border-gold-200 rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Price */}
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase block mb-2">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full text-xs p-2 bg-ivory border border-gold-200 rounded-lg"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1,000</option>
                    <option value="1000-2000">₹1,000 - ₹2,000</option>
                    <option value="above-2000">Above ₹2,000</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-burgundy text-gold-light text-xs font-bold py-3 rounded-xl uppercase tracking-wider shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            emptyTitle="No matching jewellery found"
            emptySubtitle="Try resetting search keywords or expanding your price filter."
          />
        </main>
      </div>
    </div>
  );
};
