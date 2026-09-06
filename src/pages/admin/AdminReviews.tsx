import React, { useEffect, useState } from 'react';
import { Plus, Star, Check, X, Trash2, Loader2 } from 'lucide-react';
import { Review } from '../../types';
import { getReviews, addReview, updateReviewStatus, deleteReview } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminReviews: React.FC = () => {
  const { staffProfile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    title: '',
    text: '',
    customerImage: '',
    isApproved: true,
  });

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviews(false);
      setReviews(data);
    } catch (err) {
      console.warn('Reviews load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openCreateModal = () => {
    setFormData({
      customerName: 'Ananya Sharma',
      rating: 5,
      title: 'Stunning Kundan Craftsmanship!',
      text: 'Ordered the bridal Kundan choker set via WhatsApp. The quality exceeds expected fine jewellery standard!',
      customerImage: '',
      isApproved: true,
    });
    setIsModalOpen(true);
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await updateReviewStatus(id, !currentStatus, adminUser);
      setFeedback(`Review ${!currentStatus ? 'Approved' : 'Hidden'}.`);
      await loadReviews();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update review status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.text.trim()) return;
    setSubmitting(true);

    const payload = {
      customerName: formData.customerName.trim(),
      rating: Number(formData.rating),
      title: formData.title.trim(),
      text: formData.text.trim(),
      customerImage: formData.customerImage,
      isApproved: formData.isApproved,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await addReview(payload, adminUser);
      setFeedback('Customer review added.');
      setIsModalOpen(false);
      await loadReviews();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete review?')) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteReview(id, adminUser);
      setFeedback('Review deleted.');
      await loadReviews();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Customer Testimonials & Reviews</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Approve, manage, and curate client reviews displayed on the store homepage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add Testimonial</span>
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
        ) : reviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <Star className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No customer reviews</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-gold-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {rev.isApproved ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Approved & Published
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Pending Approval
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-burgundy text-sm">{rev.title}</h4>
                <p className="text-xs text-charcoal-muted italic font-sans">"{rev.text}"</p>
                <span className="text-xs font-semibold text-charcoal block">— {rev.customerName}</span>
              </div>

              <div className="pt-3 border-t border-ivory flex items-center justify-between text-xs">
                <button
                  onClick={() => handleToggleApprove(rev.id, rev.isApproved)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    rev.isApproved
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {rev.isApproved ? 'Hide Review' : 'Approve Review'}
                </button>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-md overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">Add Testimonial</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Rating (1 to 5 Stars)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Testimonial Text *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <CloudinaryUploader
                value={formData.customerImage}
                onChange={(url) => setFormData({ ...formData, customerImage: url })}
                label="Customer Photo (Optional)"
              />

              <div className="pt-2">
                <label className="flex items-center space-x-2 font-semibold text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span>Approve & Publish Immediately</span>
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
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
