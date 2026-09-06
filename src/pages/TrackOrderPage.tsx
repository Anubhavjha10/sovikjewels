import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  AlertCircle,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getOrderById, getOrderByTrackingToken } from '../firebase/services';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { formatCurrency, formatDate, formatDateTime, createWhatsAppLink } from '../utils/formatters';
import { useSettings } from '../context/SettingsContext';

const STATUS_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const TrackOrderPage: React.FC = () => {
  const { orderId: paramOrderId } = useParams<{ orderId?: string }>();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const { settings } = useSettings();

  const [inputOrderId, setInputOrderId] = useState(paramOrderId || '');
  const [inputToken, setInputToken] = useState(tokenParam);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (idToSearch: string, tokenToVerify?: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      let fetched: Order | null = null;
      if (tokenToVerify) {
        fetched = await getOrderByTrackingToken(idToSearch.trim(), tokenToVerify.trim());
      } else {
        fetched = await getOrderById(idToSearch.trim());
      }

      if (fetched) {
        setOrder(fetched);
      } else {
        setError('No order found with the provided Order ID / Tracking Token. Please check and try again.');
        setOrder(null);
      }
    } catch (err) {
      setError('An error occurred while fetching order details.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramOrderId) {
      fetchOrder(paramOrderId, tokenParam);
    }
  }, [paramOrderId, tokenParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputOrderId, inputToken);
  };

  const handleWhatsAppHelp = () => {
    const msg = `Hello Sovik Jewels! I need assistance regarding my Order #${order?.orderId || inputOrderId}.`;
    window.open(createWhatsAppLink(settings.whatsappNumber, msg), '_blank');
  };

  const getStepIndex = (status: OrderStatus) => {
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-burgundy text-white p-8 rounded-3xl border border-gold/30 shadow-xl text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 bg-gold/20 text-gold-light border border-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ivory">
          Track Customer Order
        </h1>
        <p className="text-xs sm:text-sm text-ivory-dark font-sans max-w-lg mx-auto">
          Enter your unique Order ID (e.g. SJ-20260904-1025) to check live status updates and estimated delivery.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1">
                Order ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. SJ-20260904-1025"
                  value={inputOrderId}
                  onChange={(e) => setInputOrderId(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-4 py-3 bg-ivory rounded-xl border border-gold-300 focus:outline-none focus:border-gold font-mono uppercase"
                  required
                />
                <Search className="w-4 h-4 text-gold-700 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal uppercase tracking-wider block mb-1">
                Tracking Token (Optional)
              </label>
              <input
                type="text"
                placeholder="Secret Token"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 bg-ivory rounded-xl border border-gold-300 focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow transition-all flex items-center justify-center space-x-2"
          >
            {loading ? <span>Fetching status...</span> : <span>Track Order Status</span>}
          </button>
        </form>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start space-x-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Tracking Notice:</span>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Order Status Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-gold-300 shadow-lg overflow-hidden space-y-6">
          {/* Header Summary */}
          <div className="bg-ivory p-6 border-b border-gold-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase block">Order Identifier</span>
              <h2 className="text-xl font-mono font-bold text-burgundy">{order.orderId}</h2>
              <span className="text-xs text-charcoal-muted font-sans">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <OrderStatusBadge status={order.orderStatus} size="lg" />
              <button
                onClick={handleWhatsAppHelp}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow text-xs font-semibold flex items-center space-x-1"
                title="Ask WhatsApp Help"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">WhatsApp Help</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Visual Status Progress Checklist Timeline */}
            {order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? (
              <div className="bg-rose-100 border border-rose-300 p-4 rounded-2xl text-center text-rose-900 space-y-1">
                <h4 className="font-serif font-bold text-base">Order Status: {order.orderStatus}</h4>
                <p className="text-xs">This order has been {order.orderStatus.toLowerCase()}. Contact customer support for details.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Order Status Progress
                </h3>

                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div
                        key={step}
                        className="flex md:flex-col items-center space-x-3 md:space-x-0 md:space-y-2 flex-1 relative z-10"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-burgundy text-gold ring-4 ring-gold-200'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs text-center font-medium ${
                            isCurrent ? 'text-burgundy font-bold' : isCompleted ? 'text-charcoal' : 'text-gray-400'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delivery & Logistics Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-ivory/60 p-4 rounded-2xl border border-gold-200 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Customer Name</span>
                <span className="font-semibold text-charcoal">{order.customer.name}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Expected Delivery</span>
                <span className="font-semibold text-burgundy">
                  {order.expectedDelivery ? formatDate(order.expectedDelivery) : 'Within 3-5 Business Days'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Delivery Partner / AWB</span>
                <span className="font-semibold text-charcoal font-mono">
                  {order.deliveryPartner ? `${order.deliveryPartner} (${order.trackingNumber || 'Pending'})` : 'Dispatching soon'}
                </span>
              </div>
            </div>

            {/* Ordered Items Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                Items in this Order
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between bg-white text-xs">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gold-200"
                      />
                      <div>
                        <h4 className="font-semibold text-charcoal">{item.name}</h4>
                        <span className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</span>
                      </div>
                    </div>
                    <div className="text-right">
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
            </div>

            {/* Total Amount Box */}
            <div className="flex justify-between items-center bg-ivory p-4 rounded-xl border border-gold-300 font-serif">
              <span className="text-sm font-bold text-burgundy">Total Order Amount</span>
              <span className="text-xl font-bold text-burgundy">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
