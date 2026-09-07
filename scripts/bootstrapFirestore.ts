/**
 * Sovik Jewels — One-Time Firestore Bootstrap (npm run bootstrap)
 * ================================================================
 * Trusted SERVER-SIDE bootstrap for an EMPTY Firestore database. Uses the
 * Firebase Admin SDK, which bypasses security rules by design — so it does NOT
 * depend on any existing users/{uid} document (no chicken-and-egg problem).
 *
 * What it does (idempotent — safe to run multiple times):
 *   1. Creates users/{adminUid} with { role: "super_admin", isActive: true }
 *      (skipped if the profile already exists — never overwritten).
 *   2. Seeds ALL demo collections with the CURRENT demo data from
 *      src/data/initialDemoData.ts: websiteSettings, categories, banners,
 *      products, offers, popups, instagramPosts, reviews. Existing documents
 *      are NEVER overwritten — only missing demo documents are created
 *      (fixed demo IDs = no duplicates).
 *   3. orders/ and auditLogs/ are runtime collections and intentionally stay
 *      empty; the app creates them as customers/admins act.
 *
 * SECURITY:
 *   - Admin credentials are read ONLY from a local service-account key file or
 *     Application Default Credentials. Never from VITE_* variables, never
 *     bundled into the frontend, never committed (.gitignore already excludes
 *     *serviceAccount*.json, *credentials*.json and secrets/).
 *   - firestore.rules remain untouched and fully locked down.
 *
 * One-time console action: download a service account key
 *   Firebase Console → Project settings → Service accounts →
 *   "Generate new private key" → save as scripts/serviceAccountKey.json
 *   (or set FIREBASE_SERVICE_ACCOUNT_KEY_PATH, or use gcloud ADC).
 */

import admin from 'firebase-admin';
import type * as adminTypes from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const EXPECTED_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'sovik-jewels';
const ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL || 'sovikjewels@gmail.com';
const DRY_RUN = process.argv.includes('--dry-run');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

/** Locates a service-account key without ever printing its contents. */
function resolveCredential(): adminTypes.credential.Credential | null {
  const candidates = [
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
    path.join(scriptDir, 'serviceAccountKey.json'),
  ].filter((p): p is string => Boolean(p));

  for (const keyPath of candidates) {
    if (!fs.existsSync(keyPath)) continue;
    const json = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    if (!json.project_id || !json.client_email || !json.private_key) {
      throw new Error(`Invalid service account key file (missing project_id/client_email/private_key): ${keyPath}`);
    }
    console.log(`🔑 Using service account key: ${keyPath}`);
    console.log(`   Project: ${json.project_id}`);
    if (json.project_id !== EXPECTED_PROJECT_ID) {
      console.warn(
        `⚠️  Key project "${json.project_id}" differs from expected "${EXPECTED_PROJECT_ID}". Verify before continuing!`
      );
    }
    return admin.credential.cert(json);
  }
  return null; // fall back to Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / gcloud)
}

/** Creates the users/{uid} super_admin profile only when it does not exist yet. */
async function bootstrapAdminProfile(
  db: adminTypes.firestore.Firestore,
  dryRun: boolean
): Promise<'created' | 'exists'> {
  console.log(`👤 Resolving Firebase Auth user: ${ADMIN_EMAIL}`);
  const record = await admin.auth().getUserByEmail(ADMIN_EMAIL);
  const ref = db.collection('users').doc(record.uid);
  const snap = await ref.get();
  if (snap.exists) {
    console.log(`✅ users/${record.uid} already exists — left untouched.`);
    return 'exists';
  }
  if (dryRun) {
    console.log(`👑 [DRY RUN] Would create users/${record.uid} (role: "super_admin", isActive: true) for ${record.email}`);
    return 'created';
  }
  const now = admin.firestore.FieldValue.serverTimestamp();
  await ref.set({
    uid: record.uid,
    email: record.email || ADMIN_EMAIL,
    name: record.displayName || (record.email || ADMIN_EMAIL).split('@')[0],
    role: 'super_admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`👑 Created users/${record.uid} (role: "super_admin", isActive: true) for ${record.email}`);
  return 'created';
}

/**
 * Seeds one demo collection idempotently: missing demo docs are created,
 * existing documents (demo or real) are never touched.
 */
async function seedCollection(
  db: adminTypes.firestore.Firestore,
  name: string,
  docs: ReadonlyArray<{ id: string }>,
  dryRun: boolean
): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  for (const data of docs) {
    const ref = db.collection(name).doc(data.id);
    const snap = await ref.get();
    if (snap.exists) {
      skipped++;
      continue;
    }
    if (!dryRun) {
      await ref.set(data);
    }
    created++;
  }
  console.log(`📦 ${name}: ${created} ${dryRun ? 'would be created' : 'created'}, ${skipped} already present (untouched).`);
  return { created, skipped };
}

// ---- BOOTSTRAP FLOW ----
async function bootstrap(): Promise<void> {
  console.log(`🚀 Sovik Jewels — one-time Firestore bootstrap starting...${DRY_RUN ? ' (DRY RUN — no writes will be performed)' : ''}`);

  const credential = resolveCredential();
  // Explicit projectId avoids the GCE metadata-server lookup in the ADC path.
  const app = credential
    ? admin.initializeApp({ credential })
    : admin.initializeApp({ projectId: EXPECTED_PROJECT_ID });
  const db = admin.firestore();
  const projectId = app.options.projectId || '(resolved from ADC)';

  // 1. Super admin profile (users/{uid}) — works even when Firestore is empty.
  const profileState = await bootstrapAdminProfile(db, DRY_RUN);

  // 2. Website Settings (single fixed doc, created only when missing).
  const settingsRef = db.collection('websiteSettings').doc('general');
  if ((await settingsRef.get()).exists) {
    console.log('📦 websiteSettings: general already present (untouched).');
  } else if (DRY_RUN) {
    console.log('📦 websiteSettings: general would be created.');
  } else {
    const now = admin.firestore.FieldValue.serverTimestamp();
    await settingsRef.set({ ...DEFAULT_WEBSITE_SETTINGS, createdAt: now, updatedAt: now });
    console.log('📦 websiteSettings: general created.');
  }

  // 3. Demo collections — identical demo data to the in-app seeder.
  await seedCollection(db, 'categories', DEFAULT_CATEGORIES, DRY_RUN);
  await seedCollection(db, 'products', DEFAULT_PRODUCTS, DRY_RUN);
  await seedCollection(db, 'banners', DEFAULT_BANNERS, DRY_RUN);
  await seedCollection(db, 'offers', DEFAULT_OFFERS, DRY_RUN);
  await seedCollection(db, 'popups', DEFAULT_POPUPS, DRY_RUN);
  await seedCollection(db, 'instagramPosts', DEFAULT_INSTAGRAM_POSTS, DRY_RUN);
  await seedCollection(db, 'reviews', DEFAULT_REVIEWS, DRY_RUN);

  console.log('');
  console.log(`🎉 Bootstrap ${DRY_RUN ? 'preview (DRY RUN) finished — nothing was written' : 'complete — Firestore is ready for the Sovik Jewels CMS'}.`);
  console.log(`   Project:             ${projectId}`);
  console.log(`   Super admin profile: ${profileState === 'created' ? 'created' : 'already existed (kept)'}`);
  console.log('   Runtime collections: orders/ and auditLogs/ intentionally start empty.');
  console.log('');
  console.log('Next steps:');
  console.log(`   1. Sign in at /admin with ${ADMIN_EMAIL} — authorization is granted from the Firestore super_admin profile.`);
  console.log('   2. If the Reviews "query requires an index" error appears, run: firebase deploy --only firestore:indexes');
  console.log('   3. Re-running this bootstrap at any time is safe: existing documents are never overwritten.');
}

bootstrap()
  .then(() => process.exit(0))
  .catch((err: any) => {
    console.error('❌ Bootstrap failed:', err?.message || err);
    if (err?.code === 'auth/user-not-found') {
      console.error(`   No Firebase Auth user exists for ${ADMIN_EMAIL}.`);
      console.error('   Create it once in Firebase Console → Authentication → Users (Email/Password), then re-run.');
    } else if (
      /Could not load the default credentials|Could not refresh access token|Could not automatically determine credentials|Failed to determine project ID|metadata\.google\.internal|ENOTFOUND metadata/i.test(err?.message || '')
    ) {
      console.error('   No Admin credentials found. Provide ONE of:');
      console.error('     a) scripts/serviceAccountKey.json (Firebase Console → Project settings → Service accounts → Generate new private key)');
      console.error('     b) FIREBASE_SERVICE_ACCOUNT_KEY_PATH=<absolute path to the key JSON>');
      console.error('     c) GOOGLE_APPLICATION_CREDENTIALS, or run: gcloud auth application-default login');
      console.error('   NEVER commit this key — .gitignore already excludes *serviceAccount*.json.');
    } else if (/permission/i.test(err?.message || '') && /service account/i.test(err?.message || '')) {
      console.error('   The service account lacks Firestore/Admin permissions. Use a key from an account with Owner/Editor role.');
    }
    process.exit(1);
  });
