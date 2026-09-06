import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  Truck,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getOrderById, updateOrderStatus } from '../../firebase/services';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import {
  formatCurrency,
  formatDate,
  generateWhatsAppOrderUpdateMessage,
  createWhatsAppLink,
} from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const STATUS_LIST: OrderStatus[] = [
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

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staffProfile } = useAuth();
  const { settings } = useSettings();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
      if (data) {
        setNewStatus(data.orderStatus);
      }
    } catch (err) {
      console.warn('Fetch order error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
        <span className="text-xs font-semibold text-burgundy mt-2 block">
          Loading order file...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-white rounded-2xl border border-gold-200 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-burgundy">Order Not Found</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-burgundy text-gold-light text-xs font-bold px-5 py-2 rounded-xl"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const getTrackingUrl = () => {
    const origin = window.location.origin;
    return `${origin}/track-order/${order.orderId}?token=${order.trackingToken}`;
  };

  const handleCopyTrackingLink = () => {
    navigator.clipboard.writeText(getTrackingUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsAppUpdate = () => {
    const trackingUrl = getTrackingUrl();
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

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setFeedback(null);

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    try {
      await updateOrderStatus(order.id, newStatus, statusNote, adminUser);
      setFeedback(`Order status updated to ${newStatus}`);
      setStatusNote('');
      await fetchOrder();
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 bg-ivory text-burgundy hover:bg-gold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-mono font-bold text-burgundy">{order.orderId}</h1>
              <OrderStatusBadge status={order.orderStatus} size="lg" />
            </div>
            <span className="text-xs text-charcoal-muted font-sans">
              Order Placed: {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyTrackingLink}
            className="bg-ivory hover:bg-gold/20 text-burgundy border border-gold-300 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Tracking Link'}</span>
          </button>

          <button
            onClick={handleSendWhatsAppUpdate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center space-x-1.5 shadow"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Send WhatsApp Update</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs p-4 rounded-xl font-medium">
          {feedback}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
            <div className="flex items-center space-x-2 border-b border-ivory pb-3">
              <User className="w-4 h-4 text-gold" />
              <h3 className="font-serif font-bold text-burgundy text-base">Customer Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 block font-medium">Full Name</span>
                <span className="font-bold text-charcoal text-sm">{order.customer.name}</span>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">WhatsApp Phone</span>
                <a
                  href={createWhatsAppLink(order.customer.whatsappNumber, '')}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold font-mono text-emerald-700 hover:underline"
                >
                  {order.customer.whatsappNumber} ↗
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-ivory space-y-1">
              <div className="flex items-center space-x-1 text-gray-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Shipping Address</span>
              </div>
              <p className="text-charcoal-muted leading-relaxed font-sans bg-ivory p-3 rounded-xl border border-gold-200">
                {order.customer.address}, {order.customer.city}, {order.customer.state} -{' '}
                {order.customer.pincode}
              </p>
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
            <h3 className="font-serif font-bold text-burgundy text-base border-b border-ivory pb-3">
              Ordered Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-gray-100 border border-gold-200 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gold-200"
                    />
                    <div>
                      <h4 className="font-bold text-charcoal">{item.name}</h4>
                      <span className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</span>
                    </div>
                  </div>

                  <div className="text-right font-sans">
                    <span className="font-bold text-burgundy">
                      {formatCurrency(item.price)} × {item.quantity}
                    </span>
                    <span className="block text-[11px] text-gray-500 font-bold">
                      = {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="bg-ivory p-4 rounded-xl border border-gold-200 space-y-2">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee:</span>
                <span>+{formatCurrency(order.shippingCharge || 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gold-300 font-serif text-sm font-bold text-burgundy">
                <span>Grand Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Update Status Form & Audit Log */}
        <div className="space-y-6">
          {/* Status Update Card */}
          <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
            <h3 className="font-serif font-bold text-burgundy text-base border-b border-ivory pb-3">
              Update Order Status
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">
                  Select Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-semibold text-burgundy"
                >
                  {STATUS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">
                  Status Note / Comment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dispatched via BlueDart AWB#123"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3 rounded-xl uppercase tracking-wider shadow flex items-center justify-center space-x-2"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update Status</span>
              </button>
            </form>
          </div>

          {/* Status Change History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-3 text-xs">
              <h3 className="font-serif font-bold text-burgundy text-base border-b border-ivory pb-2">
                Order Timeline Audit History
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="bg-ivory p-3 rounded-xl border border-gold-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-burgundy">
                      <span>{h.status}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {formatDate(h.timestamp)}
                      </span>
                    </div>
                    {h.note && <p className="text-[11px] text-charcoal-muted italic">"{h.note}"</p>}
                    {h.updatedBy && (
                      <span className="text-[9px] text-gray-400 block font-mono">
                        By: {h.updatedBy}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
