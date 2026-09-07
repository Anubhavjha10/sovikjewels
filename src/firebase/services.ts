import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, functions } from './config';
import {
  Product,
  Category,
  Banner,
  Offer,
  Popup,
  InstagramPost,
  Review,
  Order,
  WebsiteSettings,
  StaffUser,
  AuditLog,
  OrderStatus,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_BANNERS,
  DEFAULT_OFFERS,
  DEFAULT_POPUPS,
  DEFAULT_INSTAGRAM_POSTS,
  DEFAULT_REVIEWS,
  DEFAULT_WEBSITE_SETTINGS,
} from '../data/initialDemoData';

// ----------------------------------------------------
// AUDIT LOG SERVICE
// ----------------------------------------------------
export const logAuditAction = async (
  userId: string,
  userName: string,
  userEmail: string,
  action: string,
  target: string,
  details?: string
): Promise<void> => {
  try {
    const logsRef = collection(db, 'auditLogs');
    await addDoc(logsRef, {
      userId,
      userName: userName || 'Admin',
      userEmail: userEmail || 'admin@sovikjewels.com',
      action,
      target,
      details: details || '',
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as AuditLog[];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
};

// ----------------------------------------------------
// WEBSITE SETTINGS SERVICE
// ----------------------------------------------------
export const getWebsiteSettings = async (): Promise<WebsiteSettings> => {
  try {
    const docRef = doc(db, 'websiteSettings', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as WebsiteSettings;
    }
  } catch (err) {
    console.warn('Using default settings fallback:', err);
  }
  return DEFAULT_WEBSITE_SETTINGS;
};

export const updateWebsiteSettings = async (
  settings: Partial<WebsiteSettings>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const docRef = doc(db, 'websiteSettings', 'general');
  await setDoc(docRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Settings Updated',
      'Website Settings'
    );
  }
};

// ----------------------------------------------------
// CATEGORY SERVICE
// ----------------------------------------------------
export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Category[];
    }
  } catch (err) {
    console.warn('Error fetching categories from Firestore, fallback to demo:', err);
  }
  return DEFAULT_CATEGORIES;
};

export const addCategory = async (
  categoryData: Omit<Category, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const colRef = collection(db, 'categories');
  const docRef = await addDoc(colRef, {
    ...categoryData,
    createdAt: serverTimestamp(),
  });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Category Created',
      categoryData.name
    );
  }
  return docRef.id;
};

export const updateCategory = async (
  id: string,
  categoryData: Partial<Category>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, { ...categoryData, updatedAt: serverTimestamp() });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Category Updated',
      categoryData.name || id
    );
  }
};

export const deleteCategory = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Category Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// PRODUCT SERVICE
// ----------------------------------------------------
export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];
    }
  } catch (err) {
    console.warn('Error fetching products from Firestore, using demo products:', err);
  }
  return DEFAULT_PRODUCTS;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const q = query(collection(db, 'products'), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (err) {
    console.warn('Error fetching product by slug from Firestore:', err);
  }
  // Check default products fallback
  const found = DEFAULT_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
  } catch (err) {
    console.warn('Error fetching product by id from Firestore:', err);
  }
  const found = DEFAULT_PRODUCTS.find((p) => p.id === id);
  return found || null;
};

export const addProduct = async (
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const colRef = collection(db, 'products');
  const docRef = await addDoc(colRef, {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Product Created',
      productData.name,
      `SKU: ${productData.sku}, Price: ₹${productData.price}`
    );
  }
  return docRef.id;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Product>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Product Updated',
      productData.name || id
    );
  }
};

export const deleteProduct = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Product Deleted',
      id
    );
  }
};

export const updateProductStock = async (
  productId: string,
  newStock: number,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, { stock: newStock, updatedAt: serverTimestamp() });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Stock Updated',
      `Product ID: ${productId}`,
      `New Stock: ${newStock}`
    );
  }
};

// ----------------------------------------------------
// BANNER SERVICE
// ----------------------------------------------------
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const q = query(collection(db, 'banners'), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Banner[];
    }
  } catch (err) {
    console.warn('Banners fetch fallback:', err);
  }
  return DEFAULT_BANNERS;
};

export const addBanner = async (
  bannerData: Omit<Banner, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'banners'), {
    ...bannerData,
    createdAt: serverTimestamp(),
  });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Banner Created',
      bannerData.heading
    );
  }
  return docRef.id;
};

export const updateBanner = async (
  id: string,
  bannerData: Partial<Banner>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await updateDoc(doc(db, 'banners', id), bannerData);
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Banner Updated',
      bannerData.heading || id
    );
  }
};

export const deleteBanner = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'banners', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Banner Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// OFFERS SERVICE
// ----------------------------------------------------
export const getOffers = async (): Promise<Offer[]> => {
  try {
    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Offer[];
    }
  } catch (err) {
    console.warn('Offers fetch fallback:', err);
  }
  return DEFAULT_OFFERS;
};

export const addOffer = async (
  offerData: Omit<Offer, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'offers'), {
    ...offerData,
    createdAt: serverTimestamp(),
  });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Offer Created',
      offerData.title
    );
  }
  return docRef.id;
};

export const updateOffer = async (
  id: string,
  offerData: Partial<Offer>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await updateDoc(doc(db, 'offers', id), offerData);
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Offer Updated',
      offerData.title || id
    );
  }
};

export const deleteOffer = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'offers', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Offer Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// POPUP SERVICE
// ----------------------------------------------------
export const getPopups = async (): Promise<Popup[]> => {
  try {
    const q = query(collection(db, 'popups'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Popup[];
    }
  } catch (err) {
    console.warn('Popups fetch fallback:', err);
  }
  return DEFAULT_POPUPS;
};

export const addPopup = async (
  popupData: Omit<Popup, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'popups'), {
    ...popupData,
    createdAt: serverTimestamp(),
  });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Popup Created',
      popupData.title
    );
  }
  return docRef.id;
};

export const updatePopup = async (
  id: string,
  popupData: Partial<Popup>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await updateDoc(doc(db, 'popups', id), popupData);
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Popup Updated',
      popupData.title || id
    );
  }
};

export const deletePopup = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'popups', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Popup Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// INSTAGRAM POSTS SERVICE
// ----------------------------------------------------
export const getInstagramPosts = async (): Promise<InstagramPost[]> => {
  try {
    const q = query(collection(db, 'instagramPosts'), orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as InstagramPost[];
    }
  } catch (err) {
    console.warn('Instagram fetch fallback:', err);
  }
  return DEFAULT_INSTAGRAM_POSTS;
};

export const addInstagramPost = async (
  postData: Omit<InstagramPost, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'instagramPosts'), {
    ...postData,
    createdAt: serverTimestamp(),
  });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Instagram Post Added',
      postData.caption
    );
  }
  return docRef.id;
};

export const updateInstagramPost = async (
  id: string,
  postData: Partial<InstagramPost>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await updateDoc(doc(db, 'instagramPosts', id), postData);
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Instagram Post Updated',
      id
    );
  }
};

export const deleteInstagramPost = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'instagramPosts', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Instagram Post Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// REVIEWS SERVICE
// ----------------------------------------------------
export const getReviews = async (onlyApproved = true): Promise<Review[]> => {
  try {
    let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    if (onlyApproved) {
      q = query(collection(db, 'reviews'), where('isApproved', '==', true), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Review[];
    }
  } catch (err: any) {
    // A "failed-precondition" error means the composite index for this exact query is
    // not deployed to the project yet. The required index is already defined in
    // firestore.indexes.json:
    //   collectionGroup: "reviews" | fields: isApproved (ASCENDING), createdAt (DESCENDING)
    // Deploy it with: firebase deploy --only firestore:indexes  (never via rule changes).
    if (err?.code === 'failed-precondition' || /requires an index|no matching index/i.test(err?.message || '')) {
      console.error(
        '[Sovik] The approved-reviews query (where isApproved == true, orderBy createdAt desc) requires a composite ' +
        'index that is not deployed yet. Deploy firestore.indexes.json with: firebase deploy --only firestore:indexes ' +
        '(or click the index-creation link included in the Firebase error above), wait for it to finish building, ' +
        'then reload. Serving default demo reviews until then.'
      );
    } else {
      console.warn('Reviews fetch fallback:', err);
    }
  }
  return DEFAULT_REVIEWS;
};

export const addReview = async (
  reviewData: Omit<Review, 'id' | 'createdAt'>,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Review Created',
      reviewData.customerName
    );
  }
  return docRef.id;
};

export const updateReviewStatus = async (
  id: string,
  isApproved: boolean,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await updateDoc(doc(db, 'reviews', id), { isApproved });
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      isApproved ? 'Review Approved' : 'Review Rejected',
      id
    );
  }
};

export const deleteReview = async (
  id: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'reviews', id));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Review Deleted',
      id
    );
  }
};

// ----------------------------------------------------
// ORDER SERVICE
// ----------------------------------------------------
export const getOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Order[];
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

export const getOrderById = async (idOrOrderId: string): Promise<Order | null> => {
  try {
    // Check by doc ID
    const docRef = doc(db, 'orders', idOrOrderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }

    // Check by orderId field (e.g. SJ-20260904-1025)
    const q = query(collection(db, 'orders'), where('orderId', '==', idOrOrderId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const snap = snapshot.docs[0];
      return { id: snap.id, ...snap.data() } as Order;
    }
  } catch (err) {
    console.error('Error fetching order by ID:', err);
  }
  return null;
};

export const getOrderByTrackingToken = async (
  orderId: string,
  token: string
): Promise<Order | null> => {
  try {
    const order = await getOrderById(orderId);
    if (order && (order.trackingToken === token || !order.trackingToken)) {
      return order;
    }
  } catch (err) {
    console.error('Error verifying order tracking token:', err);
  }
  return null;
};

export const createOrder = async (
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  deductStock: boolean = true,
  adminUser?: { uid: string; name: string; email: string }
): Promise<string> => {
  const colRef = collection(db, 'orders');
  const newOrderDoc = await addDoc(colRef, {
    ...orderData,
    deductStockApplied: deductStock,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Deduct stock for items if enabled
  if (deductStock) {
    for (const item of orderData.items) {
      try {
        const prod = await getProductById(item.productId);
        if (prod) {
          const updatedStock = Math.max(0, prod.stock - item.quantity);
          await updateProductStock(item.productId, updatedStock);
        }
      } catch (err) {
        console.warn(`Failed to deduct stock for product ${item.productId}:`, err);
      }
    }
  }

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Order Created',
      orderData.orderId,
      `Customer: ${orderData.customer.name}, Total: ₹${orderData.total}`
    );
  }

  return newOrderDoc.id;
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    const existingData = orderSnap.data() as Order;
    const historyItem = {
      status: newStatus,
      note: note || `Status updated to ${newStatus}`,
      timestamp: new Date().toISOString(),
      updatedBy: adminUser ? adminUser.name : 'System Admin',
    };

    const updatedHistory = [...(existingData.statusHistory || []), historyItem];

    await updateDoc(orderRef, {
      orderStatus: newStatus,
      statusHistory: updatedHistory,
      updatedAt: serverTimestamp(),
      updatedBy: adminUser ? adminUser.name : 'System Admin',
    });

    if (adminUser) {
      await logAuditAction(
        adminUser.uid,
        adminUser.name,
        adminUser.email,
        'Order Status Changed',
        existingData.orderId || orderId,
        `New Status: ${newStatus}`
      );
    }
  }
};

export const deleteOrder = async (
  orderId: string,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  await deleteDoc(doc(db, 'orders', orderId));
  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Order Deleted',
      orderId
    );
  }
};

// ----------------------------------------------------
// STAFF & USERS MANAGEMENT
// ----------------------------------------------------
export const getStaffMembers = async (): Promise<StaffUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    })) as StaffUser[];
  } catch (err) {
    console.error('Error fetching staff members:', err);
    return [];
  }
};

export const getStaffUsers = getStaffMembers;

export const saveStaffUserProfile = async (
  staffUser: StaffUser,
  adminUser?: { uid: string; name: string; email: string }
): Promise<void> => {
  const userRef = doc(db, 'users', staffUser.uid);
  await setDoc(userRef, {
    ...staffUser,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (adminUser) {
    await logAuditAction(
      adminUser.uid,
      adminUser.name,
      adminUser.email,
      'Staff Role / Profile Updated',
      staffUser.name,
      `Role: ${staffUser.role}, Active: ${staffUser.isActive}`
    );
  }
};

export const saveStaffUser = saveStaffUserProfile;

// ----------------------------------------------------
// DATABASE INITIALIZATION / SEEDING UTILITY
// ----------------------------------------------------
export const seedDatabaseIfEmpty = async (adminUser?: { uid: string; name: string; email: string }): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Seed Website Settings
    const settingsRef = doc(db, 'websiteSettings', 'general');
    await setDoc(settingsRef, {
      ...DEFAULT_WEBSITE_SETTINGS,
      createdAt: serverTimestamp(),
    }, { merge: true });

    // 2. Seed Categories
    for (const cat of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }

    // 3. Seed Banners
    for (const ban of DEFAULT_BANNERS) {
      await setDoc(doc(db, 'banners', ban.id), ban, { merge: true });
    }

    // 4. Seed Products
    for (const prod of DEFAULT_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
    }

    // 5. Seed Offers
    for (const offer of DEFAULT_OFFERS) {
      await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
    }

    // 6. Seed Popups
    for (const pop of DEFAULT_POPUPS) {
      await setDoc(doc(db, 'popups', pop.id), pop, { merge: true });
    }

    // 7. Seed Instagram Posts
    for (const post of DEFAULT_INSTAGRAM_POSTS) {
      await setDoc(doc(db, 'instagramPosts', post.id), post, { merge: true });
    }

    // 8. Seed Reviews
    for (const rev of DEFAULT_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), rev, { merge: true });
    }

    if (adminUser) {
      await logAuditAction(
        adminUser.uid,
        adminUser.name,
        adminUser.email,
        'Database Seeded',
        'System Initial Content'
      );
    }

    return { success: true, message: 'Database successfully populated with luxury demo data!' };
  } catch (err: any) {
    console.error('Database seeding failed:', err);
    return { success: false, message: err.message || 'Seeding failed' };
  }
};

// ----------------------------------------------------
// GEMINI AI PRODUCT DESCRIPTION SERVICE
// ----------------------------------------------------
import { httpsCallable } from 'firebase/functions';

export interface GenerateGeminiDescriptionParams {
  productName: string;
  category?: string;
  subcategory?: string;
  tags?: string;
  price?: number;
  mrp?: number;
  colour?: string;
  material?: string;
  occasion?: string;
  style?: string;
}

export const generateGeminiProductDescription = async (
  params: GenerateGeminiDescriptionParams
): Promise<string> => {
  // Secure method: Call Firebase Cloud Function (or local Vite functions emulator)
  // The Gemini API key is stored ONLY server-side in functions/.env
  // and is never exposed to the browser.
  try {
    const generateFn = httpsCallable<
      GenerateGeminiDescriptionParams,
      { description: string }
    >(functions, 'generateProductDescription');

    const res = await generateFn(params);
    if (res?.data?.description) {
      return res.data.description;
    }
  } catch (fnErr: any) {
    console.warn('httpsCallable attempt failed, trying local emulator endpoint:', fnErr?.message || fnErr);
    // Local dev / preview fallback: directly invoke Vite dev server endpoint
    try {
      const fallbackRes = await fetch('/api/generateProductDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: params }),
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData?.data?.description) {
          return fallbackData.data.description;
        }
      }
    } catch {
      // Fall through to error
    }

    const message =
      fnErr?.message ||
      'Unable to generate AI description right now. Please ensure GEMINI_API_KEY is configured in functions/.env.';
    throw new Error(message);
  }

  throw new Error('Unable to generate AI description right now. Please try again.');
};
