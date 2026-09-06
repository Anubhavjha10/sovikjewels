import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../firebase/services';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        const foundCat = cats.find((c) => c.slug === slug || c.id === slug);
        setCategory(foundCat || null);

        if (foundCat) {
          const categoryProducts = prods.filter(
            (p) => p.isActive && (p.categoryId === foundCat.id || p.categoryName.toLowerCase() === foundCat.name.toLowerCase())
          );
          setProducts(categoryProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.warn('Category page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (!loading && !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-burgundy">Category Not Found</h2>
        <p className="text-xs text-charcoal-muted">The collection you are looking for does not exist or has been renamed.</p>
        <Link
          to="/shop"
          className="inline-block bg-burgundy text-gold-light text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider"
        >
          Browse All Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-burgundy">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-burgundy">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-burgundy font-semibold">{category?.name || 'Category'}</span>
      </nav>

      {/* Category Banner Header */}
      {category && (
        <div className="relative rounded-2xl overflow-hidden bg-burgundy text-white p-8 md:p-12 border border-gold/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="inline-flex items-center space-x-1.5 text-gold text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jewellery Collection</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-ivory-dark font-sans leading-relaxed">
                {category.description}
              </p>
            )}
            <span className="inline-block bg-gold/20 text-gold-light text-xs px-3 py-1 rounded-full border border-gold/30">
              {products.length} Products Available
            </span>
          </div>

          {category.image && (
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-gold/50 shadow-md flex-shrink-0">
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        emptyTitle={`No products currently in ${category?.name || 'this category'}`}
        emptySubtitle="Check back soon for new arrivals or explore our full boutique collection."
      />
    </div>
  );
};
