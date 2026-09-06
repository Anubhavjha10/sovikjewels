# Sovik Jewels — Premium Artificial Jewellery E-Commerce & Admin CMS

Sovik Jewels is a luxury artificial jewellery online store featuring a WhatsApp-first ordering system, real-time Firestore database integration, Cloudinary media uploader, customer order tracking, and a comprehensive `/admin` CMS portal.

---

## 🚀 Firebase Setup & Deployment Instructions

### 1. Initialize Firebase CLI
Ensure you have the Firebase CLI installed and are logged in:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

---

### 2. Run Firestore Database Seeding Script

To populate your Firebase Firestore database with all demo products, categories, hero banners, special offers, promotional popups, Instagram feeds, customer reviews, and website settings:

```bash
npm run seed:db
```

*(Alternatively, log in to `/admin` and click the **"Seed Initial Demo Data"** button on the Executive Dashboard).*

---

### 3. Deploy Production-Safe Firestore Security Rules

Deploy the role-based access control (RBAC) security rules:

```bash
firebase deploy --only firestore:rules
```

---

### 4. Deploy Firestore Composite Indexes

Deploy required composite query indexes:

```bash
firebase deploy --only firestore:indexes
```

---

## 🛡️ Firestore Security Architecture & Access Control

* **Public Customers**:
  * Unauthenticated users can read public active products, active categories, active banners, active offers, active popups, approved reviews, and website settings.
  * Public users CANNOT arbitrarily write or edit CMS data or order records.
  * Order lookup is locked down to specific `orderId` and `trackingToken` queries.

* **Staff / Admin Roles (`/users/{uid}`)**:
  * `staff`: Full operational access to products, inventory stock, and customer orders.
  * `admin`: Operational access + Banners, Offers, Popups, Instagram, Reviews, and Website settings.
  * `super_admin`: Root privilege access including Staff role authorization and Audit log inspection.

---

## 🔍 Features Overview

* **Live Search Dropdown**: Debounced search matching Product Name, SKU, Category, and Tags with direct product page navigation (`/product/:slug`) and "View all results" option.
* **WhatsApp Commerce**: Dynamic prefilled inquiry message generator for WhatsApp ordering.
* **Real-time Order Tracking**: Visual progress checklist timeline (*Pending → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered*).
* **Cloudinary Uploader**: Unsigned drag-and-drop media uploader with progress tracking.
