import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Layers, Loader2 } from 'lucide-react';
import { Category } from '../../types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { slugify } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminCategories: React.FC = () => {
  const { staffProfile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    displayOrder: 1,
    isActive: true,
  });

  const loadCategoriesData = async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (err) {
      console.warn('Category load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: slugify(val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || slugify(formData.name),
      description: formData.description.trim(),
      image: formData.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      displayOrder: Number(formData.displayOrder),
      isActive: formData.isActive,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload, adminUser);
        setFeedback('Category updated successfully.');
      } else {
        await addCategory(payload, adminUser);
        setFeedback('Category created successfully.');
      }
      setIsModalOpen(false);
      await loadCategoriesData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteCategory(id, adminUser);
      setFeedback(`Category "${name}" deleted.`);
      await loadCategoriesData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Category Management</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Organize products into dynamic categories (Necklaces, Earrings, Rings, Watches, etc.)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add New Category</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 skeleton-shimmer rounded-2xl" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <Layers className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No categories created yet</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold-200 shadow-sm hover:shadow-luxury transition-all flex flex-col justify-between"
            >
              <div className="aspect-[16/9] relative bg-ivory">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 right-2.5 bg-burgundy/80 backdrop-blur-sm text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Order: #{cat.displayOrder}
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-burgundy text-base">{cat.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono">/category/{cat.slug}</span>
                  {cat.description && (
                    <p className="text-xs text-charcoal-muted line-clamp-2 mt-1 font-sans">{cat.description}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-ivory flex items-center justify-between">
                  {cat.isActive ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">
                      Disabled
                    </span>
                  )}

                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 bg-ivory text-burgundy hover:bg-gold rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Necklaces"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Category Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono text-gray-600"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <CloudinaryUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Category Cover Image (Cloudinary)"
                aspectRatio="landscape"
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full p-2 bg-ivory border border-gold-300 rounded-xl font-semibold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="catActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <label htmlFor="catActive" className="font-semibold text-charcoal cursor-pointer">
                    Enable Category
                  </label>
                </div>
              </div>

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
                  <span>{editingCategory ? 'Update' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
