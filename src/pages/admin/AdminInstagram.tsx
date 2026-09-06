import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Instagram as InstagramIcon, Loader2 } from 'lucide-react';
import { InstagramPost } from '../../types';
import { getInstagramPosts, addInstagramPost, updateInstagramPost, deleteInstagramPost } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminInstagram: React.FC = () => {
  const { staffProfile } = useAuth();
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    image: '',
    postUrl: 'https://instagram.com/sovikjewels',
    caption: '',
    displayOrder: 1,
    isActive: true,
  });

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getInstagramPosts();
      setPosts(data);
    } catch (err) {
      console.warn('Instagram posts load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      postUrl: 'https://instagram.com/sovikjewels',
      caption: 'Sparkle in royal Kundan neckpieces this wedding season. #SovikJewels',
      displayOrder: posts.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: InstagramPost) => {
    setEditingPost(p);
    setFormData({
      image: p.image,
      postUrl: p.postUrl || 'https://instagram.com/sovikjewels',
      caption: p.caption || '',
      displayOrder: p.displayOrder || 1,
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim()) return;
    setSubmitting(true);

    const payload = {
      image: formData.image,
      postUrl: formData.postUrl.trim(),
      caption: formData.caption.trim(),
      displayOrder: Number(formData.displayOrder),
      isActive: formData.isActive,
    };

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      if (editingPost) {
        await updateInstagramPost(editingPost.id, payload, adminUser);
        setFeedback('Instagram post updated.');
      } else {
        await addInstagramPost(payload, adminUser);
        setFeedback('Instagram post added.');
      }
      setIsModalOpen(false);
      await loadPosts();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete post?')) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteInstagramPost(id, adminUser);
      setFeedback('Post deleted.');
      await loadPosts();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Instagram Feed Manager</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage live Instagram grid gallery photos and links on the homepage.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add Insta Post</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full h-48 skeleton-shimmer rounded-2xl" />
        ) : posts.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-xs text-charcoal-muted rounded-2xl border border-gold-200">
            <InstagramIcon className="w-8 h-8 text-gold mx-auto mb-2" />
            <p className="font-semibold text-burgundy text-sm">No Instagram posts added</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold-200 shadow-sm flex flex-col justify-between"
            >
              <div className="aspect-square relative bg-ivory">
                <img src={post.image} alt="Insta" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2 text-xs">
                <p className="line-clamp-2 text-[11px] text-charcoal-muted">{post.caption}</p>
                <div className="flex items-center justify-between pt-2 border-t border-ivory">
                  <span className="text-[10px] text-gray-400 font-mono">#{post.displayOrder}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(post)}
                      className="p-1 bg-ivory text-burgundy hover:bg-gold rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded"
                    >
                      <Trash2 className="w-3 h-3" />
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
          <div className="bg-white rounded-3xl border border-gold-300 shadow-2xl w-full max-w-md overflow-hidden my-8">
            <div className="bg-burgundy text-white p-6 flex items-center justify-between border-b border-gold/30">
              <h2 className="text-xl font-serif font-bold text-ivory">
                {editingPost ? 'Edit Instagram Post' : 'Add Instagram Post'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gold hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <CloudinaryUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Instagram Photo (Cloudinary)"
              />

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Instagram Post URL</label>
                <input
                  type="url"
                  required
                  value={formData.postUrl}
                  onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">Caption</label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal uppercase block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-bold"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="accent-burgundy"
                  />
                  <span className="font-semibold text-charcoal">Active</span>
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
                  <span>{editingPost ? 'Update' : 'Save Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
