import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Image as ImageIcon,
  Tag,
  MessageSquare,
  Instagram,
  Star,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Loader2,
  FileText,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, staffProfile, loading, role, isStaff, isProfilePersistedInFirestore, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-10 h-10 text-gold animate-spin" />
          <span className="text-xs font-semibold text-burgundy">Verifying Security Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-gold-300 shadow-xl text-center space-y-4 max-w-md">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-burgundy">Access Denied</h2>
          <p className="text-xs text-charcoal-muted">
            Your account ({user.email}) has not been granted staff/admin authorization permissions.
          </p>
          {!staffProfile && !isProfilePersistedInFirestore && (
            <div className="text-left bg-amber-50 border border-amber-300 text-amber-900 text-[11px] p-3 rounded-xl leading-relaxed">
              <strong className="font-semibold block mb-1">Admin Profile Setup Required</strong>
              Authorization is read only from Firestore. Create the document{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded break-all">users/{user.uid}</code> with fields{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">role: "super_admin"</code> and{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">isActive: true</code>{' '}
              (plus uid, name, email) in Firebase Console → Firestore Database, then reload this page.
            </div>
          )}
          <button
            onClick={() => logout()}
            className="bg-burgundy text-gold-light text-xs font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Stock Inventory', path: '/admin/stock', icon: Boxes },
    { label: 'Hero Banners', path: '/admin/banners', icon: ImageIcon },
    { label: 'Special Offers', path: '/admin/offers', icon: Tag },
    { label: 'Promotional Popups', path: '/admin/popups', icon: MessageSquare },
    { label: 'Instagram Posts', path: '/admin/instagram', icon: Instagram },
    { label: 'Customer Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Staff Management', path: '/admin/staff', icon: Users, superOnly: true },
    { label: 'Website Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText, superOnly: true },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.superOnly && role !== 'super_admin') return false;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-burgundy-950 text-white flex-col justify-between border-r border-gold/30 sticky top-0 h-screen">
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-burgundy flex items-center justify-center border border-gold">
              <span className="font-serif font-bold text-gold">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-ivory">
                Sovik <span className="gold-gradient-text">CMS</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gold">Admin Panel</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gold text-burgundy font-bold shadow'
                      : 'text-gray-300 hover:bg-burgundy-900 hover:text-gold-light'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-burgundy-800 space-y-3 bg-burgundy-950">
          <div className="flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-gold text-burgundy font-bold flex items-center justify-center uppercase">
              {staffProfile?.name?.[0] || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-ivory truncate">{staffProfile?.name || user.email}</span>
              <span className="text-[10px] text-gold uppercase tracking-wider font-bold">
                {role || 'Staff'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <Link
              to="/"
              className="flex-1 bg-burgundy-900 hover:bg-burgundy text-gold-light text-[11px] py-1.5 px-2 rounded-lg text-center flex items-center justify-center space-x-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Store Front</span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-[11px] p-1.5 rounded-lg flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gold-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 text-charcoal hover:text-burgundy"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-serif font-bold text-burgundy text-lg">
              Sovik Jewels Management
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-block text-xs bg-gold/20 text-burgundy border border-gold/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Role: {role || 'Staff'}
            </span>
            <Link
              to="/"
              target="_blank"
              className="text-xs bg-burgundy text-gold-light px-3 py-1.5 rounded-lg font-semibold hover:bg-burgundy-900 transition-colors"
            >
              View Live Website ↗
            </Link>
          </div>
        </header>

        {!isProfilePersistedInFirestore && (
          <div className="bg-amber-50 border-b border-amber-300 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Admin Profile Setup:</strong> Account <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">{user?.email}</code> is authenticated, but no document was found at <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">users/{user?.uid}</code> in Firestore. Create it with <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">role: "super_admin"</code> and <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">isActive: true</code> in Firebase Console to enable admin writes.
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative w-4/5 max-w-xs bg-burgundy-950 text-white h-full p-5 shadow-2xl flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-burgundy-800">
                <span className="font-serif text-lg font-bold text-ivory">Admin Navigation</span>
                <button onClick={() => setMobileDrawerOpen(false)}>
                  <X className="w-6 h-6 text-gold" />
                </button>
              </div>

              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium ${
                        active ? 'bg-gold text-burgundy font-bold' : 'text-gray-300 hover:bg-burgundy-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-rose-800 text-white font-bold text-xs py-3 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
