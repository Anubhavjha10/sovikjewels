import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  User,
  MapPin,
  Package,
} from 'lucide-react';
import { Product, OrderItem } from '../../types';
import { getProducts, createOrder } from '../../firebase/services';
import { formatCurrency, generateOrderId } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const AdminCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { staffProfile } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Form
  const [customer, setCustomer] = useState({
    name: '',
    whatsappNumber: '',
    altPhone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Selected Order Items
  const [selectedItems, setSelectedItems] = useState<
    { product: Product; quantity: number }[]
  >([]);

  // Financials
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<
    'Pending' | 'Advance Paid' | 'Fully Paid' | 'COD'
  >('Pending');
  const [deductStock, setDeductStock] = useState<boolean>(true);

  // Logistics
  const [deliveryPartner, setDeliveryPartner] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchProds = async () => {
      try {
        const data = await getProducts();
        setProducts(data.filter((p) => p.isActive));
      } catch (err) {
        console.warn('Products load error:', err);
      } finally {
        setLoadingProds(false);
      }
    };
    fetchProds();
  }, []);

  const handleAddProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    // Check if already selected
    const existingIndex = selectedItems.findIndex((i) => i.product.id === productId);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { product: prod, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
      return;
    }
    const updated = [...selectedItems];
    updated[index].quantity = newQty;
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const grandTotal = Math.max(0, subtotal + shippingCharge - discountAmount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customer.name.trim() || !customer.whatsappNumber.trim()) {
      setError('Customer name and WhatsApp number are required.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Please add at least one product item to the order.');
      return;
    }

    setSubmitting(true);

    const orderIdCode = generateOrderId();
    const orderItems: OrderItem[] = selectedItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
      image: item.product.images?.[0] || '',
    }));

    const adminUser = staffProfile
      ? { uid: staffProfile.uid, name: staffProfile.name, email: staffProfile.email }
      : undefined;

    const payload = {
      orderId: orderIdCode,
      customer: {
        name: customer.name.trim(),
        whatsappNumber: customer.whatsappNumber.trim(),
        altPhone: customer.altPhone.trim(),
        email: customer.email.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state.trim(),
        pincode: customer.pincode.trim(),
      },
      items: orderItems,
      subtotal,
      shippingCharge,
      discount: discountAmount,
      total: grandTotal,
      orderStatus: 'Confirmed' as const,
      paymentStatus,
      deliveryPartner: deliveryPartner.trim(),
      trackingNumber: trackingNumber.trim(),
      notes: notes.trim(),
    };

    try {
      const newOrder = await createOrder(payload, deductStock, adminUser);
      navigate(`/admin/orders/${newOrder.id}`);
    } catch (err: any) {
      console.error('Create order error:', err);
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 bg-ivory text-burgundy hover:bg-gold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-burgundy">Create WhatsApp Order</h1>
            <p className="text-xs text-charcoal-muted">
              Log new customer order details, calculate totals, and update stock inventory.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-100 border border-rose-300 text-rose-900 text-xs p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="space-y-6">
        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-ivory pb-3">
            <User className="w-5 h-5 text-gold" />
            <h2 className="font-serif font-bold text-burgundy text-base">
              Customer Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                WhatsApp Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={customer.whatsappNumber}
                onChange={(e) => setCustomer({ ...customer, whatsappNumber: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                placeholder="Secondary Mobile"
                value={customer.altPhone}
                onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="priya@example.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="pt-3 border-t border-ivory space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="font-semibold text-charcoal uppercase">Delivery Address</span>
            </div>

            <div>
              <input
                type="text"
                placeholder="Street Address / House No. / Landmark..."
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
              <input
                type="text"
                placeholder="State"
                value={customer.state}
                onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={customer.pincode}
                onChange={(e) => setCustomer({ ...customer, pincode: e.target.value })}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Product Selector & Items Table */}
        <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-ivory pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gold" />
              <h2 className="font-serif font-bold text-burgundy text-base">Select Order Products</h2>
            </div>

            {/* Select product dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddProduct(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs p-2 bg-ivory border border-gold-300 rounded-xl font-semibold text-burgundy cursor-pointer"
            >
              <option value="">+ Add Product Item...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.price)}) — Stock: {p.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items List */}
          {selectedItems.length === 0 ? (
            <div className="p-8 text-center text-charcoal-muted">
              No products added to this order yet. Select products from the dropdown above.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gold-200 rounded-xl overflow-hidden">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gold-200"
                    />
                    <div>
                      <h4 className="font-bold text-charcoal">{item.product.name}</h4>
                      <span className="text-[11px] text-gray-400 font-mono">
                        SKU: {item.product.sku} | Price: {formatCurrency(item.product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 font-medium">Qty:</span>
                      <input
                        type="number"
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-14 p-1.5 bg-ivory border border-gold-300 rounded-lg text-center font-bold text-burgundy"
                      />
                    </div>

                    <span className="font-bold text-burgundy w-20 text-right">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment & Logistics Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs">
            <h3 className="font-serif font-bold text-burgundy text-base border-b border-ivory pb-2">
              Logistics & Payment
            </h3>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-semibold"
              >
                <option value="Pending">Pending Payment</option>
                <option value="Advance Paid">Advance Paid</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="COD">Cash on Delivery (COD)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">
                  Delivery Partner
                </label>
                <input
                  type="text"
                  placeholder="e.g. BlueDart"
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal uppercase block mb-1">
                  Tracking Number / AWB
                </label>
                <input
                  type="text"
                  placeholder="AWB Code"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-charcoal uppercase block mb-1">
                Admin Notes
              </label>
              <input
                type="text"
                placeholder="Internal notes regarding delivery..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-ivory border border-gold-300 rounded-xl"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductStock}
                  onChange={(e) => setDeductStock(e.target.checked)}
                  className="accent-burgundy"
                />
                <span className="font-semibold text-burgundy">
                  Deduct product inventory stock automatically upon order creation
                </span>
              </label>
            </div>
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gold-200/60 shadow-sm space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-burgundy text-base border-b border-ivory pb-2">
                Order Billing Breakdown
              </h3>

              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-medium">Subtotal:</span>
                <span className="font-bold text-charcoal">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Shipping Charge (₹):</span>
                <input
                  type="number"
                  min={0}
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(Number(e.target.value))}
                  className="w-24 p-1.5 bg-ivory border border-gold-300 rounded-lg text-right font-semibold"
                />
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Discount Amount (₹):</span>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-24 p-1.5 bg-ivory border border-gold-300 rounded-lg text-right font-semibold text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gold-200 space-y-4">
              <div className="flex justify-between items-baseline font-serif">
                <span className="text-lg font-bold text-burgundy">Grand Total:</span>
                <span className="text-2xl font-bold text-burgundy">{formatCurrency(grandTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="w-full bg-burgundy hover:bg-burgundy-900 text-gold-light font-bold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span>Confirm & Create Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
