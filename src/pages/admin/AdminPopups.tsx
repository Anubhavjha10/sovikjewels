import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, MessageSquare, Loader2 } from 'lucide-react';
import { Popup } from '../../types';
import { getPopups, addPopup, updatePopup, deletePopup } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminPopups: React.FC = () => {
  const { staffProfile } = useAuth();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    delaySeconds: 3,
    buttonText: 'Shop Festive Offer',
    buttonUrl: '/shop',
    frequency: 'once_per_session' as 'once_per_session' | 'always',
    isActive: true,
  });

  const loadPopupsData = async () => {
    setLoading(true);
    try {
      const data = await getPopups();
      setPopups(data);
    } catch (err) {
      console.warn('Popups load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopupsData();
  }, []);

  const openCreateModal = () => {
    setEditingPopup(null);
    setFormData({
      title: 'Festive Season Special!',
      description: 'Get a complimentary Velvet Jewellery Box on all WhatsApp orders above ₹1,499!',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      delaySeconds: 3,
      buttonText: 'CLAIM OFFER ON WHATSAPP',
      buttonUrl: '/shop',
      frequency: 'once_per_session',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Popup) => {
    setEditingPopup(p);
    setFormData({
      title: p.title,
      description: p.description || '',
      image: p.image || '',
      delaySeconds: p.delaySeconds || 3,
      buttonText: p.buttonText || 'Shop Now',
      buttonUrl: p.buttonUrl || '/shop',
      frequency: p.frequency || 'once_per_session',
      isActive: p.isActive,
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
      image: formData.image,
      delaySeconds: Number(formData.delaySeconds),
      buttonText: formData.buttonText.trim(),
      buttonUrl: formData.buttonUrl.trim(),
      frequency: formData.frequency,
      isActive: formData.isActive,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingPopup) {
        await updatePopup(editingPopup.id, payload, adminUser);
        setFeedback('Popup updated.');
      } else {
        await addPopup(payload, adminUser);
        setFeedback('Popup created.');
      }
      setIsModalOpen(false);
      await loadPopupsData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save popup');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete popup?')) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deletePopup(id, adminUser);
      setFeedback('Popup deleted.');
      await loadPopupsData();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete popup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Promotional Popups CMS</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure welcome popups, promotional timing, and offer banners.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add New Popup</span>
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
        ) : popups.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <MessageSquare className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No popups created</p>
          </div>
        ) : (
          popups.map((popup) => (
            <div
              key={popup.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold-200 shadow-sm p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-bold text-burgundy text-lg">{popup.title}</h3>
                <p className="text-xs text-charcoal-muted mt-1">{popup.description}</p>
                <span className="text-[10px] text-gray-400 font-mono block mt-2">
                  Delay: {popup.delaySeconds}s | Frequency: {popup.frequency}
                </span>
              </div>

              <div className="pt-3 border-t border-ivory flex items-center justify-between text-xs">
                {popup.isActive ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Active Popup
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}

                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(popup)}
                    className="p-1.5 bg-ivory text-burgundy hover:bg-gold rounded-lg transition-colors border border-gold-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(popup.id)}
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
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-lg overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingPopup ? 'Edit Popup' : 'Add Popup'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Popup Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Popup Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <CloudinaryUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Popup Image (Cloudinary)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Delay (Seconds)</label>
                  <input
                    type="number"
                    value={formData.delaySeconds}
                    onChange={(e) => setFormData({ ...formData, delaySeconds: Number(e.target.value) })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold text-center"
                  />
                </div>

                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e: any) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-medium"
                  >
                    <option value="once_per_session">Once Per Session</option>
                    <option value="always">Always Show</option>
                  </select>
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
                  <span>Active & Triggered on Homepage</span>
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
                  <span>{editingPopup ? 'Update' : 'Save Popup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
