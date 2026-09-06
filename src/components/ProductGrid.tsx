import React from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { Sparkles } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyTitle = "No products found",
  emptySubtitle = "Try adjusting your filters or browse another category.",
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden p-3 space-y-3">
            <div className="aspect-square skeleton-shimmer rounded-lg" />
            <div className="h-4 skeleton-shimmer w-3/4 rounded" />
            <div className="h-3 skeleton-shimmer w-1/2 rounded" />
            <div className="h-8 skeleton-shimmer w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-gold-200/50 p-8 shadow-sm my-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ivory text-gold mb-4 border border-gold-300">
          <Sparkles className="w-8 h-8 text-burgundy" />
        </div>
        <h3 className="text-xl font-serif font-semibold text-burgundy">{emptyTitle}</h3>
        <p className="text-sm text-charcoal-muted max-w-md mx-auto mt-2 font-sans">
          {emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
