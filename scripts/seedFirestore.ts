/**
 * Sovik Jewels — Firestore Database Seeding Script (npm run seed:db)
 * ==================================================================
 * SECURITY: production Firestore rules allow writes only for ACTIVE staff/admin
 * profiles, so this script signs in with an admin Firebase Auth account before
 * writing. Never weaken the rules to allow anonymous seeding.
 *
 * Usage (PowerShell):
 *   $env:SEED_ADMIN_EMAIL = "admin@sovikjewels.com"
 *   $env:SEED_ADMIN_PASSWORD = "<password>"
 *   npm run seed:db
 *
 * The admin account must already have a Firestore profile document at
 * users/{uid} with { role: "admin" | "super_admin", isActive: true }
 * (see scripts/checkAdminProfile.mjs).
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_BANNERS,
  DEFAULT_OFFERS,
  DEFAULT_POPUPS,
  DEFAULT_INSTAGRAM_POSTS,
  DEFAULT_REVIEWS,
  DEFAULT_WEBSITE_SETTINGS,
} from '../src/data/initialDemoData';

// Mirrors src/firebase/config.ts. Kept self-contained because Vite's
// import.meta.env is not available when this script runs under tsx/Node.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBGFGp5U6AQAKFWxKoNf6uAaBdtMH8r3j0',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'sovik-jewels.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'sovik-jewels',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'sovik-jewels.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '804660328975',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:804660328975:web:989bbaf0374923e437417a',
};

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || '';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || '';

async function seedFirestoreData() {
  console.log('🚀 Starting Sovik Jewels Firestore Database Seeding...');

  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    console.error('❌ Seeding aborted: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set.');
    console.error('   Firestore rules require an active admin profile for every write, so this');
    console.error('   script signs in as an admin instead of writing anonymously.');
    console.error('   PowerShell example:');
    console.error('     $env:SEED_ADMIN_EMAIL = "admin@sovikjewels.com"');
    console.error('     $env:SEED_ADMIN_PASSWORD = "<password>"');
    console.error('     npm run seed:db');
    console.error('   Alternatively use the "Seed Initial Demo Data" button in /admin/dashboard.');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let signedInUid = '';
  try {
    console.log(`🔐 Signing in as ${SEED_ADMIN_EMAIL}...`);
    const credential = await signInWithEmailAndPassword(auth, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD);
    signedInUid = credential.user.uid;
    console.log(`✅ Authenticated (uid: ${signedInUid})`);
    // 1. Website Settings
    console.log('📦 Seeding Website Settings...');
    await setDoc(
      doc(db, 'websiteSettings', 'general'),
      {
        ...DEFAULT_WEBSITE_SETTINGS,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Categories
    console.log(`📦 Seeding ${DEFAULT_CATEGORIES.length} Categories...`);
    for (const cat of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }

    // 3. Products
    console.log(`📦 Seeding ${DEFAULT_PRODUCTS.length} Products...`);
    for (const prod of DEFAULT_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
    }

    // 4. Hero Banners
    console.log(`📦 Seeding ${DEFAULT_BANNERS.length} Hero Banners...`);
    for (const ban of DEFAULT_BANNERS) {
      await setDoc(doc(db, 'banners', ban.id), ban, { merge: true });
    }

    // 5. Special Offers
    console.log(`📦 Seeding ${DEFAULT_OFFERS.length} Offers...`);
    for (const offer of DEFAULT_OFFERS) {
      await setDoc(doc(db, 'offers', offer.id), offer, { merge: true });
    }

    // 6. Popups
    console.log(`📦 Seeding ${DEFAULT_POPUPS.length} Popups...`);
    for (const pop of DEFAULT_POPUPS) {
      await setDoc(doc(db, 'popups', pop.id), pop, { merge: true });
    }

    // 7. Instagram Posts
    console.log(`📦 Seeding ${DEFAULT_INSTAGRAM_POSTS.length} Instagram Posts...`);
    for (const post of DEFAULT_INSTAGRAM_POSTS) {
      await setDoc(doc(db, 'instagramPosts', post.id), post, { merge: true });
    }

    // 8. Reviews
    console.log(`📦 Seeding ${DEFAULT_REVIEWS.length} Customer Reviews...`);
    for (const rev of DEFAULT_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), rev, { merge: true });
    }

    console.log('✅ Firestore Database successfully populated with all demo content!');
    process.exit(0);
  } catch (error: any) {
    if (String(error?.code || '').startsWith('auth/')) {
      console.error(`❌ Firebase Auth sign-in failed (${error.code}).`);
      console.error('   Verify SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD for an existing admin account.');
    } else if (
      error?.code === 'permission-denied' ||
      /missing or insufficient permissions/i.test(error?.message || '')
    ) {
      console.error('❌ Seeding failed: permission-denied from Firestore security rules.');
      console.error(
        `   The signed-in account (${signedInUid || SEED_ADMIN_EMAIL}) has no active admin profile document.`
      );
      console.error(
        '   Create users/{uid} with { role: "super_admin", isActive: true } — see scripts/checkAdminProfile.mjs.'
      );
    } else {
      console.error('❌ Seeding failed with error:', error);
    }
    process.exit(1);
  }
}

seedFirestoreData();
