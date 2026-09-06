import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { createWhatsAppLink } from '../utils/formatters';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  const handleWhatsApp = () => {
    const link = createWhatsAppLink(
      settings.whatsappNumber,
      'Hello Sovik Jewels! I am reaching out to inquire about custom orders or boutique assistance.'
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-burgundy text-white p-8 rounded-3xl border border-gold/30 shadow-xl text-center space-y-3">
        <span className="text-xs font-semibold text-gold tracking-widest uppercase">Client Support</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">Contact Sovik Jewels</h1>
        <p className="text-xs sm:text-sm text-ivory-dark font-sans max-w-lg mx-auto">
          We are here to assist you with order inquiries, product customization, and tracking updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gold-300 shadow-md space-y-6">
          <h2 className="text-xl font-serif font-bold text-burgundy border-b border-ivory pb-3">
            Boutique Information
          </h2>

          <div className="space-y-4 text-xs text-charcoal">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-ivory text-gold border border-gold-300 flex-shrink-0">
                <MapPin className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <span className="font-bold text-burgundy uppercase tracking-wider block">Boutique Address</span>
                <p className="text-charcoal-muted mt-0.5 leading-relaxed">{settings.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-ivory text-gold border border-gold-300 flex-shrink-0">
                <Phone className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <span className="font-bold text-burgundy uppercase tracking-wider block">Call Us</span>
                <a href={`tel:${settings.contactMobile}`} className="text-charcoal font-semibold hover:text-gold">
                  {settings.contactMobile}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-ivory text-gold border border-gold-300 flex-shrink-0">
                <Mail className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <span className="font-bold text-burgundy uppercase tracking-wider block">Email Support</span>
                <a href={`mailto:${settings.contactEmail}`} className="text-charcoal font-semibold hover:text-gold">
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-ivory text-gold border border-gold-300 flex-shrink-0">
                <Clock className="w-5 h-5 text-burgundy" />
              </div>
              <div>
                <span className="font-bold text-burgundy uppercase tracking-wider block">Support Hours</span>
                <span className="text-charcoal-muted">Mon - Sat: 10:00 AM - 8:00 PM IST</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-ivory">
            <button
              onClick={handleWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Connect on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-gold-300 shadow-md">
          {formSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-2xl font-serif font-bold text-burgundy">Message Sent Successfully</h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                Thank you for contacting Sovik Jewels. Our customer care representative will get back to you shortly.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 bg-burgundy text-gold-light text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wider"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-burgundy border-b border-ivory pb-3">
                Send Us a Query
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-3 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-charcoal uppercase block mb-1">Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full text-xs p-3 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal uppercase block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-3 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal uppercase block mb-1">Message / Inquiry *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Details regarding product availability, custom order requests, or tracking assistance..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs p-3 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
