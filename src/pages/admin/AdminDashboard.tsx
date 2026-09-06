import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Plus,
  Database,
  Sparkles,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Product, Order } from '../../types';
import { getProducts, getOrders, seedDatabaseIfEmpty } from '../../firebase/services';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { staffProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([getProducts(), getOrders()]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSeedData = async () => {
    if (!window.confirm('Populate/Seed Firestore with luxury demo products, banners, offers, and categories?')) return;
    setSeeding(true);
    setSeedMessage(null);
    try {
      const adminInfo = staffProfile
        ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
        : undefined;
      const res = await seedDatabaseIfEmpty(adminInfo);
      setSeedMessage(res.message);
      await loadDashboardData();
    } catch (err: any) {
      setSeedMessage(err.message || 'Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.orderStatus === 'Confirmed').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const date = typeof o.createdAt === 'string' ? o.createdAt : o.createdAt?.toDate?.()?.toISOString();
    return date?.startsWith(todayStr);
  });

  const totalSalesRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-burgundy text-white p-6 sm:p-8 rounded-3xl border border-gold/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gold tracking-widest uppercase">CMS Executive Overview</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ivory mt-1">
            Welcome back, {staffProfile?.name || 'Admin'}
          </h1>
          <p className="text-xs text-ivory-dark mt-1">
            Manage jewellery products, track orders, update inventory stock and website settings.
          </p>
        </div>

        {/* Quick Seeding Button */}
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="bg-gold hover:bg-gold-dark text-burgundy font-bold text-xs py-3 px-5 rounded-xl shadow-md flex items-center space-x-2 transition-all uppercase tracking-wider"
        >
          {seeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-burgundy" />
              <span>Seeding Demo Data...</span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4 text-burgundy" />
              <span>Seed Initial Demo Data</span>
            </>
          )}
        </button>
      </div>

      {seedMessage && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-xl font-medium">
          {seedMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gold-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Total Products</span>
            <div className="p-2 rounded-xl bg-burgundy/10 text-burgundy">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-burgundy font-serif block">
            {totalProductsCount}
          </span>
          <span className="text-[11px] text-gray-400">Catalogue items</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gold-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Total Orders</span>
            <div className="p-2 rounded-xl bg-gold/20 text-burgundy">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-burgundy font-serif block">
            {totalOrdersCount}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">{todayOrders.length} placed today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gold-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-burgundy font-serif block">
            {formatCurrency(totalSalesRevenue)}
          </span>
          <span className="text-[11px] text-gray-400">All created orders value</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gold-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-muted uppercase">Pending / Confirmed</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-700 font-serif">{pendingOrdersCount}</span>
            <span className="text-xs text-gray-400">Pending</span>
            <span className="text-sm font-bold text-blue-700 font-serif">/ {confirmedOrdersCount}</span>
            <span className="text-xs text-gray-400">Confirmed</span>
          </div>
          <span className="text-[11px] text-gray-400">Orders requiring dispatch</span>
        </div>
      </div>

      {/* Secondary Inventory Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/stock"
          className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between hover:bg-amber-100/80 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase">Low Stock Alert</h4>
              <p className="text-xs text-amber-800">{lowStockCount} items below minimum threshold</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-700" />
        </Link>

        <Link
          to="/admin/stock"
          className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between hover:bg-rose-100/80 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900 uppercase">Out of Stock</h4>
              <p className="text-xs text-rose-800">{outOfStockCount} items completely sold out</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-700" />
        </Link>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-burgundy text-base">CMS Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/admin/products"
            className="p-3.5 bg-ivory hover:bg-gold/10 border border-gold-300 rounded-xl text-center font-bold text-xs text-burgundy transition-all flex flex-col items-center space-y-1.5"
          >
            <Plus className="w-5 h-5 text-gold" />
            <span>Add Product</span>
          </Link>

          <Link
            to="/admin/orders/create"
            className="p-3.5 bg-burgundy hover:bg-burgundy-900 text-gold-light rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center space-y-1.5 shadow"
          >
            <ShoppingBag className="w-5 h-5 text-gold" />
            <span>Create Order</span>
          </Link>

          <Link
            to="/admin/banners"
            className="p-3.5 bg-ivory hover:bg-gold/10 border border-gold-300 rounded-xl text-center font-bold text-xs text-burgundy transition-all flex flex-col items-center space-y-1.5"
          >
            <Sparkles className="w-5 h-5 text-gold" />
            <span>Add Banner</span>
          </Link>

          <Link
            to="/admin/offers"
            className="p-3.5 bg-ivory hover:bg-gold/10 border border-gold-300 rounded-xl text-center font-bold text-xs text-burgundy transition-all flex flex-col items-center space-y-1.5"
          >
            <TrendingUp className="w-5 h-5 text-gold" />
            <span>Add Offer</span>
          </Link>

          <Link
            to="/admin/categories"
            className="p-3.5 bg-ivory hover:bg-gold/10 border border-gold-300 rounded-xl text-center font-bold text-xs text-burgundy transition-all flex flex-col items-center space-y-1.5"
          >
            <Package className="w-5 h-5 text-gold" />
            <span>Add Category</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table Preview */}
      <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-ivory pb-3">
          <h3 className="font-serif font-bold text-burgundy text-base">Recent Customer Orders</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-burgundy hover:text-gold uppercase tracking-wider">
            View All Orders →
          </Link>
        </div>

        {loading ? (
          <div className="h-40 skeleton-shimmer rounded-xl" />
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-charcoal-muted">
            No orders created yet. Click "Create Order" to log a customer order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-burgundy">{order.orderId}</td>
                    <td className="p-3 font-medium text-charcoal">{order.customer.name}</td>
                    <td className="p-3 font-bold text-burgundy">{formatCurrency(order.total)}</td>
                    <td className="p-3 text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="p-3">
                      <OrderStatusBadge status={order.orderStatus} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-xs text-burgundy hover:text-gold font-bold underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
