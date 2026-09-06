export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description: string;
  shortDescription: string;
  price: number;
  mrp: number;
  discount: number; // calculated percentage
  images: string[];
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: any;
}

export interface Banner {
  id: string;
  heading: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: any;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  couponText?: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  ctaText: string;
  ctaLink: string;
  createdAt: any;
}

export interface Popup {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
  delaySeconds: number;
  frequency: 'once_per_session' | 'always';
  createdAt: any;
}

export interface InstagramPost {
  id: string;
  postUrl: string;
  image: string;
  caption: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: any;
}

export interface Review {
  id: string;
  customerName: string;
  customerImage?: string;
  rating: number;
  title?: string;
  text: string;
  isApproved: boolean;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  whatsappNumber: string;
  alternateMobile?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Advance Paid'
  | 'Fully Paid'
  | 'Cash on Delivery'
  | 'COD';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  note?: string;
  timestamp: string; // ISO String or DD/MM/YYYY HH:mm
  updatedBy: string;
}

export interface Order {
  id: string;
  orderId: string; // SJ-YYYYMMDD-XXXX
  trackingToken: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge?: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  expectedDelivery?: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  notes?: string;
  orderSource?: string;
  deductStockApplied?: boolean;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  updatedBy: string;
}

export interface WebsiteSettings {
  brandName: string;
  logo: string;
  favicon: string;
  tagline: string;
  contactMobile: string;
  whatsappNumber: string;
  contactEmail: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  footerDescription: string;
  copyrightText: string;
  productInquiryTemplate: string;
  orderUpdateTemplate: string;
  trackingTemplate: string;
}

export type UserRole = 'super_admin' | 'admin' | 'staff';

export interface StaffUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  target: string;
  details?: string;
  timestamp: any;
}
