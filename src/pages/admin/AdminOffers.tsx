import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Loader2 } from 'lucide-react';
import { Offer } from '../../types';
import { getOffers, addOffer, updateOffer, deleteOffer } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminOffers: React.FC = () => {
  const { staffProfile } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    couponText: '',
    discount: '',
    bannerImage: '',
    ctaText: 'Claim Offer',
    ctaLink: '/shop',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await getOffers();
      setOffers(data);
    } catch (err) {
      console.warn('Offers load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: 'Festive Bridal Combo Savings',
      description: 'Get Flat 15% OFF + Free Gift Box on all Kundan orders above ₹1,499!',
      couponText: 'FESTIVE15',
      discount: 'FLAT 15% OFF',
      bannerImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      ctaText: 'Claim Offer Now',
      ctaLink: '/shop?filter=offers',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingOffer(o);
    setFormData({
      title: o.title,
      description: o.description || '',
      couponText: o.couponText || '',
      discount: o.discount || '',
      bannerImage: o.bannerImage || '',
      ctaText: o.ctaText || 'Claim Offer',
      ctaLink: o.ctaLink || '/shop',
      startDate: o.startDate || '',
      endDate: o.endDate || '',
      isActive: o.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setSubmitting(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      couponText: formData.couponText.trim().toUpperCase(),
      discount: formData.discount.trim(),
      bannerImage: formData.bannerImage,
      ctaText: formData.ctaText.trim(),
      ctaLink: formData.ctaLink.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, payload, adminUser);
        setFeedback('Offer updated.');
      } else {
        await addOffer(payload, adminUser);
        setFeedback('Offer created.');
      }
      setIsModalOpen(false);
      await loadOffers();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete offer?')) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteOffer(id, adminUser);
      setFeedback('Offer deleted.');
      await loadOffers();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Special Offers & Promo Codes</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Create discount banners, promo coupon codes, and validity windows.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add New Offer</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full h-48 skeleton-shimmer rounded-2xl" />
        ) : offers.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <Tag className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No special offers added yet</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold-200 shadow-sm flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-gold text-burgundy font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                    {offer.discount || 'Special Offer'}
                  </span>
                  {offer.couponText && (
                    <span className="font-mono text-xs font-bold text-burgundy bg-ivory border border-gold-300 px-2 py-0.5 rounded">
                      CODE: {offer.couponText}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-burgundy text-lg">{offer.title}</h3>
                <p className="text-xs text-charcoal-muted">{offer.description}</p>
              </div>

              <div className="p-4 bg-ivory/50 border-t border-ivory flex items-center justify-between text-xs">
                {offer.isActive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full">
                    Expired/Inactive
                  </span>
                )}

                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-1.5 bg-white text-burgundy hover:bg-gold rounded-lg transition-colors border border-gold-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-xl overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingOffer ? 'Edit Offer' : 'Add Offer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE15"
                    value={formData.couponText}
                    onChange={(e) => setFormData({ ...formData, couponText: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Discount Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. FLAT 15% OFF"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <CloudinaryUploader
                value={formData.bannerImage}
                onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                label="Offer Card Image (Cloudinary)"
                aspectRatio="landscape"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
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
                  <span>Active Offer</span>
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
                  <span>{editingOffer ? 'Update' : 'Save Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
