import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
  Sparkles,
  Loader2,
  Tag as TagIcon,
  AlertCircle,
} from 'lucide-react';
import { Product, Category } from '../../types';
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  generateGeminiProductDescription,
} from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { formatCurrency, slugify, generateUniqueSKU, generateUniqueSlug } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminProducts: React.FC = () => {
  const { staffProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    categoryName: '',
    description: '',
    shortDescription: '',
    price: 0,
    mrp: 0,
    images: [''],
    stock: 10,
    lowStockThreshold: 3,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isOffer: false,
    tagsInput: '',
  });

  // AI Description Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isManualDescriptionEdited, setIsManualDescriptionEdited] = useState(false);
  // Manual-edit tracking for SKU / Slug so auto-generation never overwrites admin choices
  const [isManualSKUEdited, setIsManualSKUEdited] = useState(false);
  const [isManualSlugEdited, setIsManualSlugEdited] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: cats[0].id, categoryName: cats[0].name }));
      }
    } catch (err) {
      console.warn('Products load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsManualDescriptionEdited(false);
    setIsManualSKUEdited(false);
    setIsManualSlugEdited(false);
    setAiError(null);
    const defaultCat = categories[0];
    setFormData({
      name: '',
      slug: '',
      sku: '',
      categoryId: defaultCat?.id || '',
      categoryName: defaultCat?.name || '',
      description: '',
      shortDescription: '',
      price: 999,
      mrp: 1999,
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'],
      stock: 15,
      lowStockThreshold: 3,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isOffer: false,
      tagsInput: 'Kundan, Necklace, Festive',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsManualDescriptionEdited(true); // Don't auto-overwrite existing product description
    setIsManualSKUEdited(true); // Preserve existing SKU when editing
    setIsManualSlugEdited(true); // Preserve existing slug when editing
    setAiError(null);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      mrp: product.mrp,
      images: product.images && product.images.length > 0 ? product.images : [''],
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 3,
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      isNewArrival: product.isNewArrival || false,
      isOffer: product.isOffer || false,
      tagsInput: product.tags ? product.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  // Handle Product Name input change -> auto SKU + auto Slug + debounced AI description
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Only auto-generate SKU and Slug if not editing an existing product
    if (!editingProduct) {
      // Only regenerate if the admin has NOT manually overridden SKU/slug
      const generatedSku = isManualSKUEdited ? null : generateUniqueSKU(val, formData.categoryName, products);
      const generatedSlug = isManualSlugEdited ? null : generateUniqueSlug(val, products);
      
      setFormData((prev) => ({
        ...prev,
        name: val,
        ...(generatedSku !== null ? { sku: generatedSku } : {}),
        ...(generatedSlug !== null ? { slug: generatedSlug } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: val,
      }));
    }
  };

  // Handle Gemini AI Description Generation
  const handleGenerateAIDescription = async (overrideName?: string) => {
    const pName = overrideName || formData.name;
    if (!pName.trim()) {
      setAiError('Please enter a Product Name first.');
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    try {
      const generatedDesc = await generateGeminiProductDescription({
        productName: pName.trim(),
        category: formData.categoryName,
        tags: formData.tagsInput,
        price: formData.price,
        mrp: formData.mrp,
      });

      setFormData((prev) => ({
        ...prev,
        description: generatedDesc,
      }));
    } catch (err: any) {
      // Log the full technical error (CORS/function/API failures) in the dev console
      // while keeping the user-facing message friendly.
      console.error('AI Description Error:', err?.message || err);
      if (
        err?.code === 'functions/unavailable' ||
        err?.code === 'functions/aborted' ||
        err?.code === 'unavailable'
      ) {
        setAiError('Unable to generate description right now. Please try again.');
      } else if (err?.code === 'functions/failed-precondition') {
        setAiError('Gemini API key is not configured on the server yet. Please contact admin.');
      } else {
        setAiError('Unable to generate description right now. Please try again.');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  // Debounced AI generation trigger on name typing
  useEffect(() => {
    if (editingProduct || isManualDescriptionEdited || !formData.name.trim()) return;

    const timer = setTimeout(() => {
      if (!formData.description.trim() && !aiGenerating) {
        handleGenerateAIDescription(formData.name);
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [formData.name]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    const catObj = categories.find((c) => c.id === catId);
    const catName = catObj ? catObj.name : '';

    setFormData((prev) => {
      // Only auto-regenerate SKU on category change if admin hasn't manually set it
      const updatedSku = !editingProduct && !isManualSKUEdited
        ? generateUniqueSKU(prev.name, catName, products)
        : prev.sku;
      return {
        ...prev,
        categoryId: catId,
        categoryName: catName,
        sku: updatedSku,
      };
    });
  };

  const handleImageChange = (index: number, url: string) => {
    const newImgs = [...formData.images];
    newImgs[index] = url;
    setFormData((prev) => ({ ...prev, images: newImgs }));
  };

  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index: number) => {
    if (formData.images.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;
    setSubmitting(true);
    setFeedback(null);

    const discountPercentage =
      formData.mrp > formData.price
        ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
        : 0;

    const tagsArray = formData.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanImages = formData.images.filter((img) => img.trim() !== '');
    if (cleanImages.length === 0) {
      cleanImages.push('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800');
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || slugify(formData.name),
      sku: formData.sku.trim(),
      categoryId: formData.categoryId,
      categoryName: formData.categoryName,
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(),
      price: Number(formData.price),
      mrp: Number(formData.mrp),
      discount: discountPercentage,
      images: cleanImages,
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold),
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isNewArrival: formData.isNewArrival,
      isOffer: formData.isOffer,
      tags: tagsArray,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload, adminUser);
        setFeedback({ type: 'success', message: 'Product updated successfully.' });
      } else {
        await addProduct(payload, adminUser);
        setFeedback({ type: 'success', message: 'New product added successfully.' });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Product save error:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to save product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteProduct(id, adminUser);
      setFeedback({ type: 'success', message: `Product "${name}" deleted.` });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete product' });
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategoryFilter !== 'all' && p.categoryId !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const mName = p.name.toLowerCase().includes(q);
      const mSku = p.sku.toLowerCase().includes(q);
      const mCat = p.categoryName.toLowerCase().includes(q);
      return mName || mSku || mCat;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Product Management</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage jewellery inventory items, prices, images, and feature flags.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-900'
              : 'bg-rose-100 border border-rose-300 text-rose-900'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gold-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search by product name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-ivory rounded-lg border border-gold-300 focus:outline-none focus:border-gold"
          />
          <Search className="w-4 h-4 text-gold-700 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-charcoal-muted font-medium">Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-ivory border border-gold-300 rounded-lg px-3 py-2 text-charcoal font-medium focus:outline-none focus:border-gold"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
            <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
            <p>Loading products catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted space-y-2">
            <Package className="w-8 h-8 text-gold mx-auto" />
            <p className="font-semibold text-burgundy text-sm">No products found</p>
            <p>Try adjusting your search criteria or click "Add New Product".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Price / MRP</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;

                  return (
                    <tr key={p.id} className="hover:bg-ivory/50 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gold-200"
                        />
                      </td>
                      <td className="p-3.5 font-semibold text-charcoal">
                        <div>
                          <span>{p.name}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.isFeatured && (
                              <span className="bg-gold/20 text-burgundy text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {p.isBestSeller && (
                              <span className="bg-charcoal text-ivory text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-gray-500">{p.sku}</td>
                      <td className="p-3.5 text-charcoal-muted font-medium">{p.categoryName}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-burgundy">{formatCurrency(p.price)}</div>
                        {p.mrp > p.price && (
                          <div className="text-[11px] text-gray-400 line-through">
                            {formatCurrency(p.mrp)}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-medium">
                        {isOut ? (
                          <span className="text-red-600 font-bold">🔴 0 (Out)</span>
                        ) : isLow ? (
                          <span className="text-amber-600 font-bold">🟠 {p.stock} (Low)</span>
                        ) : (
                          <span className="text-emerald-700">🟢 {p.stock}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {p.isActive ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-ivory text-burgundy hover:bg-gold hover:text-burgundy rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Kundan Necklace"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      // Slug sanitization: lowercase, spaces→hyphens, strip bad chars
                      const raw = e.target.value.toLowerCase();
                      const clean = raw
                        .replace(/\s+/g, '-')
                        .replace(/[^\w\-]+/g, '')
                        .replace(/\-\-+/g, '-');
                      setIsManualSlugEdited(true);
                      setFormData({ ...formData, slug: clean });
                    }}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">SKU / Product Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => {
                      setIsManualSKUEdited(true);
                      setFormData({ ...formData, sku: e.target.value.toUpperCase() });
                    }}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={handleCategoryChange}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-medium"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-ivory/60 p-4 rounded-2xl border border-gold-200">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gold-300 rounded-lg font-bold text-burgundy"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gold-300 rounded-lg text-gray-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gold-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Low Stock Limit</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-gold-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief 1-line summary..."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-charcoal uppercase block">Full Description</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateAIDescription()}
                      disabled={aiGenerating}
                      className="bg-burgundy/10 hover:bg-burgundy hover:text-gold-light text-burgundy font-bold text-[11px] px-3 py-1 rounded-lg border border-gold-300 transition-all flex items-center space-x-1.5"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-gold-700" />
                          <span>✨ Generating description...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-gold" />
                          <span>{formData.description ? '✨ Regenerate Description' : '✨ Generate Description'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="mb-2 p-2 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-lg flex items-center justify-between">
                      <span>{aiError}</span>
                      <button
                        type="button"
                        onClick={() => handleGenerateAIDescription()}
                        className="font-bold underline text-burgundy ml-2"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder="Detailed craft specifications, materials, and care instructions..."
                    value={formData.description}
                    onChange={(e) => {
                      setIsManualDescriptionEdited(true);
                      setFormData({ ...formData, description: e.target.value });
                    }}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl leading-relaxed focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-charcoal uppercase block">
                    Product Images (Cloudinary Uploader)
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-burgundy hover:text-gold font-bold underline"
                  >
                    + Add Another Image
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <CloudinaryUploader
                        value={imgUrl}
                        onChange={(url) => handleImageChange(idx, url)}
                        label={`Image ${idx + 1} ${idx === 0 ? '(Main)' : ''}`}
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(idx)}
                          className="text-[10px] text-red-600 underline hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Kundan, Pearl, Bridal, Necklace"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-ivory">
                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Active</span>
                </label>

                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Featured</span>
                </label>

                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOffer}
                    onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Offer Item</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-ivory flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-ivory text-charcoal hover:bg-gray-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-burgundy hover:bg-burgundy-900 text-gold-light rounded-xl font-bold uppercase tracking-wider shadow flex items-center space-x-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
                  <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
