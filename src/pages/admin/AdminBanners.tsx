import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Banner } from '../../types';
import { getBanners, addBanner, updateBanner, deleteBanner } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminBanners: React.FC = () => {
  const { staffProfile } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    desktopImage: '',
    mobileImage: '',
    heading: '',
    description: '',
    buttonText: 'Shop Collection',
    buttonLink: '/shop',
    displayOrder: 1,
    isActive: true,
  });

  const loadBannersData = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err) {
      console.warn('Banners load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannersData();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      desktopImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600',
      mobileImage: '',
      heading: 'Royal Kundan & Festive Collections',
      description: 'Handcrafted artificial jewellery polished in champagne gold for royal occasions.',
      buttonText: 'EXPLORE BOUTIQUE',
      buttonLink: '/shop',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setFormData({
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage || '',
      heading: b.heading,
      description: b.description || '',
      buttonText: b.buttonText || 'Shop Collection',
      buttonLink: b.buttonLink || '/shop',
      displayOrder: b.displayOrder || 1,
      isActive: b.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.heading.trim()) return;
    setSubmitting(true);

    const payload = {
      desktopImage: formData.desktopImage,
      mobileImage: formData.mobileImage || formData.desktopImage,
      heading: formData.heading.trim(),
      description: formData.description.trim(),
      buttonText: formData.buttonText.trim(),
      buttonLink: formData.buttonLink.trim(),
      displayOrder: Number(formData.displayOrder),
      isActive: formData.isActive,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, payload, adminUser);
        setFeedback('Hero banner updated.');
      } else {
        await addBanner(payload, adminUser);
        setFeedback('Hero banner added.');
      }
      setIsModalOpen(false);
      await loadBannersData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner slide?')) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteBanner(id, adminUser);
      setFeedback('Banner deleted.');
      await loadBannersData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Hero Banners Manager</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage main homepage slider banners, titles, desktop & mobile image uploads.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add New Banner</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full h-48 skeleton-shimmer rounded-2xl" />
        ) : banners.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <ImageIcon className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No custom hero banners added</p>
            <p>Click "Add New Banner" to create homepage slides.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold-200 shadow-sm flex flex-col justify-between"
            >
              <div className="aspect-[21/9] bg-burgundy relative">
                <img
                  src={banner.desktopImage}
                  alt={banner.heading}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy/90 to-transparent p-4 flex flex-col justify-end">
                  <h3 className="text-lg font-serif font-bold text-ivory drop-shadow">
                    {banner.heading}
                  </h3>
                  <span className="text-[10px] text-gold font-mono">
                    Order: #{banner.displayOrder}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {banner.description && (
                  <p className="text-xs text-charcoal-muted line-clamp-2">{banner.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-ivory text-xs">
                  {banner.isActive ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active Banner
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}

                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-1.5 bg-ivory text-burgundy hover:bg-gold rounded-lg transition-colors"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                      title="Delete Banner"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingBanner ? 'Edit Hero Banner' : 'Add Hero Banner'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Heading Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Kundan & Festive Collections"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Subheading Description</label>
                <textarea
                  rows={2}
                  placeholder="Short tagline text..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CloudinaryUploader
                  value={formData.desktopImage}
                  onChange={(url) => setFormData({ ...formData, desktopImage: url })}
                  label="Desktop Banner Image (16:9)"
                  aspectRatio="landscape"
                />

                <CloudinaryUploader
                  value={formData.mobileImage}
                  onChange={(url) => setFormData({ ...formData, mobileImage: url })}
                  label="Mobile Banner Image (Optional)"
                  aspectRatio="landscape"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Button Link URL</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Slide Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 font-semibold text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Active & Visible on Homepage</span>
                </label>
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
                  <span>{editingBanner ? 'Update' : 'Save Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
