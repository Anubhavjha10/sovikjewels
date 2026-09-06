import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';

// Navigation & Footer Layout
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

// Public Customer Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetail } from './pages/ProductDetail';
import { OffersPage } from './pages/OffersPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';

// Admin CMS Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCreateOrder } from './pages/admin/AdminCreateOrder';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminStock } from './pages/admin/AdminStock';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminOffers } from './pages/admin/AdminOffers';
import { AdminPopups } from './pages/admin/AdminPopups';
import { AdminInstagram } from './pages/admin/AdminInstagram';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Public Customer Shell Component
const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-ivory font-sans text-charcoal selection:bg-gold selection:text-burgundy">
      <div>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
      <div>
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <WishlistProvider>
            <Routes>
              {/* Customer Facing Store Routes */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* Admin Portal Authentication */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Protected Admin CMS Dashboard Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/create" element={<AdminCreateOrder />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="stock" element={<AdminStock />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="offers" element={<AdminOffers />} />
                <Route path="popups" element={<AdminPopups />} />
                <Route path="instagram" element={<AdminInstagram />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </WishlistProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
