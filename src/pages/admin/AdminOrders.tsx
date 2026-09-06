import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Copy,
  Check,
  MessageCircle,
  Eye,
  Trash2,
  ChevronDown,
  ShoppingBag,
  Filter,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrders, updateOrderStatus, deleteOrder } from '../../firebase/services';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppOrderUpdateMessage,
  createWhatsAppLink,
} from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const STATUS_TABS: (OrderStatus | 'All')[] = [
  'All',
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Returned',
];

export const AdminOrders: React.FC = () => {
  const { staffProfile } = useAuth();
  const { settings } = useSettings();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await updateOrderStatus(orderId, newStatus, `Updated to ${newStatus}`, adminUser);
      setFeedback(`Order status updated to ${newStatus}`);
      await loadOrders();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update status');
    }
  };

  const handleDeleteOrder = async (id: string, orderIdCode: string) => {
    if (!window.confirm(`Delete order "${orderIdCode}"?`)) return;
    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await deleteOrder(id, adminUser);
      setFeedback(`Order ${orderIdCode} deleted.`);
      await loadOrders();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to delete order');
    }
  };

  const getTrackingUrl = (order: Order) => {
    const origin = window.location.origin;
    return `${origin}/track-order/${order.orderId}?token=${order.trackingToken}`;
  };

  const handleCopyTrackingLink = (order: Order) => {
    const link = getTrackingUrl(order);
    navigator.clipboard.writeText(link);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleShareTrackingWhatsApp = (order: Order) => {
    const trackingUrl = getTrackingUrl(order);
    const message = generateWhatsAppOrderUpdateMessage(
      order.customer.name,
      order.orderId,
      order.orderStatus,
      trackingUrl,
      settings.orderUpdateTemplate
    );
    const whatsappUrl = createWhatsAppLink(order.customer.whatsappNumber, message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'All' && order.orderStatus !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchName = order.customer.name.toLowerCase().includes(q);
      const matchPhone = order.customer.whatsappNumber.includes(q);
      return matchId || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-burgundy">Orders & Logistics CMS</h1>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Log official WhatsApp orders, manage statuses, and generate customer tracking links.
          </p>
        </div>

        <Link
          to="/admin/orders/create"
          className="bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 px-5 rounded-xl uppercase tracking-wider shadow flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Create New Order</span>
        </Link>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-3.5 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search Order ID, Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-ivory rounded-lg border border-gold-300 focus:outline-none focus:border-gold"
            />
            <Search className="w-4 h-4 text-gold-700 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-charcoal-muted font-medium">
            Total Orders: <strong className="text-burgundy">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All' ? orders.length : orders.filter((o) => o.orderStatus === tab).length;
            const active = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  active
                    ? 'bg-burgundy text-gold font-bold shadow'
                    : 'bg-ivory text-charcoal hover:bg-gold-100 hover:text-burgundy'
                }`}
              >
                <span>{tab}</span>
                <span className="ml-1.5 opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-charcoal-muted space-y-2">
            <ShoppingBag className="w-8 h-8 text-gold animate-spin mx-auto" />
            <p>Loading orders database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-muted space-y-2">
            <ShoppingBag className="w-8 h-8 text-gold mx-auto" />
            <p className="font-semibold text-burgundy text-sm">No orders found in this view</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory text-burgundy font-bold uppercase tracking-wider border-b border-gold-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions & WhatsApp Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-ivory/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-burgundy">
                      <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.orderId}
                      </Link>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-charcoal">{order.customer.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {order.customer.whatsappNumber}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-charcoal">
                        {order.items?.length || 0} Item(s)
                      </span>
                      <div className="text-[11px] text-gray-400 line-clamp-1">
                        {order.items?.map((i) => i.name).join(', ')}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-burgundy">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="p-3.5 text-gray-500">{formatDate(order.createdAt)}</td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <OrderStatusBadge status={order.orderStatus} size="sm" />
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className="block w-full text-[10px] bg-ivory border border-gold-300 rounded px-1.5 py-1 text-charcoal font-semibold cursor-pointer"
                        >
                          {STATUS_TABS.filter((t) => t !== 'All').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="p-3.5 text-right space-y-1">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyTrackingLink(order)}
                          className="p-1.5 bg-ivory text-burgundy hover:bg-gold hover:text-burgundy rounded-lg transition-colors"
                          title="Copy Public Tracking Link"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareTrackingWhatsApp(order)}
                          className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                          title="Share Tracking Link on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* View Detail */}
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-1.5 bg-ivory text-burgundy hover:bg-gold hover:text-burgundy rounded-lg transition-colors"
                          title="View Full Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderId)}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
