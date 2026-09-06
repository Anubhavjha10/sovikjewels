import React, { useEffect, useState } from 'react';
import { Search, Boxes, Check, AlertTriangle, XCircle, Save, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { getProducts, updateProductStock } from '../../firebase/services';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminStock: React.FC = () => {
  const { staffProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Inline editing stock map: productId -> new stock value
  const [stockEdits, setStockEdits] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.warn('Stock load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const handleStockChange = (id: string, val: number) => {
    setStockEdits((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const handleSaveStock = async (product: Product) => {
    const newQty = stockEdits[product.id];
    if (newQty === undefined || newQty === product.stock) return;

    setSavingId(product.id);
    setFeedback(null);

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await updateProductStock(product.id, newQty, adminUser);
      setFeedback(`Updated stock for "${product.name}" to ${newQty}`);
      await loadStockData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

    if (stockFilter === 'low' && !isLow) return false;
    if (stockFilter === 'out' && !isOut) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }

    return true;
  });

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Stock & Inventory Control</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Quickly monitor stock levels, update product inventory quantities, and manage low stock thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock: {lowStockCount}</span>
          </div>

          <div className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
            <XCircle className="w-4 h-4" />
            <span>Out of Stock: {outOfStockCount}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search SKU or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-ivory rounded-lg border border-gold-300 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-gold-700 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-charcoal-muted font-medium">Filter Stock:</span>
          <div className="flex space-x-1 bg-ivory p-1 rounded-xl border border-gold-300 text-xs">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                stockFilter === 'all' ? 'bg-burgundy text-gold font-bold' : 'text-charcoal'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                stockFilter === 'low' ? 'bg-amber-600 text-white font-bold' : 'text-amber-800'
              }`}
            >
              Low ({lowStockCount})
            </button>
            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                stockFilter === 'out' ? 'bg-rose-600 text-white font-bold' : 'text-rose-800'
              }`}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
            <Boxes className="w-8 h-8 text-gold animate-spin mx-auto" />
            <p>Loading inventory stock data...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted">No stock items match filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5">Current Stock Qty</th>
                  <th className="p-3.5">Update Stock Qty</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                  const editedVal = stockEdits[p.id] !== undefined ? stockEdits[p.id] : p.stock;
                  const isModified = editedVal !== p.stock;

                  return (
                    <tr key={p.id} className="hover:bg-ivory/50 transition-colors">
                      <td className="p-3.5 font-semibold text-charcoal flex items-center space-x-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gold-200"
                        />
                        <span>{p.name}</span>
                      </td>

                      <td className="p-3.5 font-mono text-gray-500">{p.sku}</td>

                      <td className="p-3.5 font-bold text-burgundy">{formatCurrency(p.price)}</td>

                      <td className="p-3.5">
                        {isOut ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🔴 Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🟠 Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            🟢 In Stock
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-bold text-sm text-burgundy">{p.stock}</td>

                      <td className="p-3.5">
                        <input
                          type="number"
                          min={0}
                          value={editedVal}
                          onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                          className="w-20 p-1.5 bg-ivory border border-gold-300 rounded-lg font-bold text-center text-burgundy focus:outline-none focus:border-gold"
                        />
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={!isModified || savingId === p.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center space-x-1 ml-auto ${
                            isModified
                              ? 'bg-burgundy text-gold-light hover:bg-burgundy-900 shadow'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {savingId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          <span>Save</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
