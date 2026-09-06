import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, MessageCircle, Globe, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { updateWebsiteSettings } from '../../firebase/services';
import { CloudinaryUploader } from '../../components/CloudinaryUploader';
import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const { staffProfile } = useAuth();

  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await updateWebsiteSettings(formData, adminUser);
      await refreshSettings();
      setFeedback('Website & WhatsApp settings updated successfully.');
    } catch (err: any) {
      setFeedback(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Website & Business Settings</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Configure WhatsApp numbers, prefilled inquiry templates, brand identity, address & social links.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-xl font-medium">
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* WhatsApp Commerce Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-ivory pb-3">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif font-bold text-burgundy text-base">
              WhatsApp Commerce Setup
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                WhatsApp Business Mobile Number *
              </label>
              <input
                type="text"
                required
                placeholder="+919876543210"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full p-3 bg-ivory border border-gold-300 rounded-xl font-mono focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Use full country code without spaces (e.g. +919876543210)
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal uppercase block mb-1">
              Product Inquiry WhatsApp Template
            </label>
            <textarea
              rows={4}
              value={formData.productInquiryTemplate}
              onChange={(e) => setFormData({ ...formData, productInquiryTemplate: e.target.value })}
              className="w-full p-3 bg-ivory border border-gold-300 rounded-xl font-mono text-[11px]"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Available Variables: {'{product_name}'}, {'{sku}'}, {'{price}'}, {'{quantity}'}, {'{date}'}, {'{product_url}'}
            </span>
          </div>

          <div>
            <label className="font-semibold text-charcoal uppercase block mb-1">
              Customer Order Update WhatsApp Template
            </label>
            <textarea
              rows={4}
              value={formData.orderUpdateTemplate}
              onChange={(e) => setFormData({ ...formData, orderUpdateTemplate: e.target.value })}
              className="w-full p-3 bg-ivory border border-gold-300 rounded-xl font-mono text-[11px]"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Available Variables: {'{customer_name}'}, {'{order_id}'}, {'{status}'}, {'{tracking_url}'}
            </span>
          </div>
        </div>

        {/* Brand & Boutique Contact */}
        <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-ivory pb-3">
            <Globe className="w-5 h-5 text-gold" />
            <h2 className="font-serif font-bold text-burgundy text-base">Brand Information & Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">Contact Mobile</label>
              <input
                type="text"
                value={formData.contactMobile}
                onChange={(e) => setFormData({ ...formData, contactMobile: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-charcoal uppercase block mb-1">Boutique Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-charcoal uppercase block mb-1">Footer Brand Story Description</label>
            <textarea
              rows={2}
              value={formData.footerDescription}
              onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
              className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">Instagram URL</label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">Facebook URL</label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">YouTube URL</label>
              <input
                type="text"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3.5 px-8 rounded-xl uppercase tracking-wider shadow-lg flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-gold" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
