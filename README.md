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

### 2. One-Time Bootstrap (empty database → fully working CMS)

For a brand-new/empty Firestore database, run the trusted server-side bootstrap **once**. It uses the Firebase Admin SDK — which bypasses security rules by design — so it does **not** depend on any existing `users/{uid}` profile (no chicken-and-egg problem), and it is fully **idempotent**:

```powershell
npm run bootstrap
```

It automatically:

1. Resolves the Firebase Auth admin account (`sovikjewels@gmail.com` by default; override with `BOOTSTRAP_ADMIN_EMAIL`).
2. Creates `users/{uid}` with `{ uid, email, name, role: "super_admin", isActive: true, createdAt }` — skipped if the profile already exists (never overwritten).
3. Seeds **all demo collections** (`websiteSettings`, `categories`, `banners`, `products`, `offers`, `popups`, `instagramPosts`, `reviews`) using the exact demo data in `src/data/initialDemoData.ts`. Existing documents are **never overwritten**, and fixed demo IDs prevent duplicates — re-running is always safe.
4. Leaves runtime collections (`orders`, `auditLogs`) empty for the application to populate.

**Admin credentials (server-side only — never in VITE_/frontend/git):** download a service account key once from Firebase Console → Project settings → Service accounts → *Generate new private key*, and save it as `scripts/serviceAccountKey.json` (already gitignored). Alternatives: `FIREBASE_SERVICE_ACCOUNT_KEY_PATH=<path>` or gcloud ADC (`gcloud auth application-default login`).

*(The legacy `npm run seed:db` client-SDK seeder still works once the admin profile exists, but it cannot bootstrap an empty database because Firestore security rules require an active staff/admin profile for every write — by design.)*

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

`firestore.indexes.json` defines the following composite indexes, which must also be **deployed to the cloud project**:

| Collection | Field 1 | Field 2 | Required by |
|---|---|---|---|
| `reviews` | `isApproved` ASCENDING | `createdAt` DESCENDING | `getReviews(true)` in `src/firebase/services.ts` — `where('isApproved','==',true), orderBy('createdAt','desc')` (public homepage) |
| `products` | `isActive` ASCENDING | `createdAt` DESCENDING | Active product listing query |
| `products` | `categoryId` ASCENDING | `createdAt` DESCENDING | Category-filtered product query |

> **About the "The query requires an index." console error for reviews:** the exact query is `query(collection(db, 'reviews'), where('isApproved', '==', true), orderBy('createdAt', 'desc'))`. The matching composite index above is already correctly configured in `firestore.indexes.json`; the error only appears when it has not been deployed to the Firebase project yet. Fix by deploying the command above (or by clicking the `create_composite` index link included in the Firebase error message), waiting for the index to finish building in Firebase Console → Firestore Database → Indexes, then reloading the site. **No security-rule changes are needed or permitted for this.**

---

### 5. Additional Staff Accounts

The bootstrap creates the first `super_admin`. Additional staff accounts are created in Firebase Console → Authentication (Email/Password), then granted roles from **/admin/staff** (super_admin only), which writes the `users/{uid}` profile document. `node scripts/checkAdminProfile.mjs <UID> <EMAIL>` remains available for manual profile creation if ever needed.

Admin authentication/profile state is read **strictly from Firestore** — the app intentionally has **no client-side `super_admin` fallback**. A Firebase Auth login alone grants no admin capability until a profile document exists with `{ role: "admin" | "super_admin", isActive: true }`.

---

### 6. Deploy the Website to Firebase Hosting

The production build is deployed to **Firebase Hosting**. The SPA rewrite in `firebase.json` (`"source": "**" → "/index.html"`) is what makes clean URLs work on **direct navigation and refresh** — without it, deep links such as `/admin`, `/shop` or `/product/:slug` return a Hosting 404 because no static file exists at those paths:

```bash
npm run deploy:hosting
```

This runs the production build (`npm run build`) and deploys the `dist/` output. Every frontend route (`/`, `/shop`, `/category/:slug`, `/product/:slug`, `/offers`, `/track-order`, `/wishlist`, `/contact`, `/about`, `/admin`, `/admin/dashboard`, `/admin/orders`, …) is served `index.html` by Hosting and then rendered client-side by React Router. Static assets (`/assets/*.js|css`, `/favicon.svg`) are real files, so Hosting serves them directly — the rewrite never swallows them. Hashed asset filenames get immutable caching, while `index.html` is always revalidated so refreshes pick up new deploys immediately.

> The `/admin` CMS is protected **in-app**: the server always serves the app for `/admin*`; the authentication guard (`AdminLayout` + Firebase Auth session persistence, restored via `onAuthStateChanged` before any redirect) decides what to render. Refreshing a signed-in admin session keeps the user logged in (Firebase Auth `browserLocalPersistence`; ID-token refresh is handled automatically by the SDK).

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
