import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid admin credentials. Please verify email and password.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gold-300 shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-burgundy flex items-center justify-center border border-gold shadow-md mx-auto">
            <span className="font-serif text-2xl font-bold text-gold">S</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">
            Sovik <span className="gold-gradient-text">Jewels</span> CMS
          </h1>
          <p className="text-xs text-charcoal-muted uppercase tracking-wider font-semibold">
            Admin & Staff Portal Login
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@sovikjewels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-3 bg-ivory rounded-xl border border-gold-300 focus:outline-none focus:border-gold"
              />
              <Mail className="w-4 h-4 text-gold-700 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-3 bg-ivory rounded-xl border border-gold-300 focus:outline-none focus:border-gold"
              />
              <Lock className="w-4 h-4 text-gold-700 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:shadow-gold-glow transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-ivory text-center">
          <p className="text-[11px] text-gray-400">
            Protected CMS Access. Firebase Authentication required.
          </p>
        </div>
      </div>
    </div>
  );
};
