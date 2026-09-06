import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/firebase/config';
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

async function seedFirestoreData() {
  console.log('🚀 Starting Sovik Jewels Firestore Database Seeding...');

  try {
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
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
}

seedFirestoreData();
