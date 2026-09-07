/**
 * Firestore RULES verification test for Sovik Jewels Business Settings.
 *
 * Runs against the LOCAL Firestore + Auth emulators, which enforce the project's
 * real firestore.rules file. It reproduces the EXACT operation the app performs:
 * setDoc(doc(db, 'websiteSettings', 'general'), {...}, { merge: true }) — i.e. an
 * upsert (create when the doc is missing, update when it exists).
 *
 * Run:  npm run test:rules
 * (requires Java 11+ for the emulators)
 *
 * No real credentials are used — the Auth emulator issues throwaway tokens.
 */

const AUTH_BASE = 'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts';
const FS_BASE = 'http://localhost:8080/v1/projects/sovik-jewels/databases/(default)/documents';

async function signUp(n) {
  const res = await fetch(`${AUTH_BASE}:signUp?key=fake-api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `rules-test-${n}@sovik.test`,
      password: 'Test123456!',
      returnSecureToken: true,
    }),
  });
  const data = await res.json();
  if (!data.idToken) throw new Error('Auth emulator signUp failed: ' + JSON.stringify(data));
  return { uid: data.localId, idToken: data.idToken };
}

/** Admin-context write (emulator bypass header). Used only to arrange fixtures. */
async function adminWriteDoc(path, fields) {
  const res = await fetch(`${FS_BASE}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields }),
  });
  return res.status;
}

async function adminDeleteDoc(path) {
  const res = await fetch(`${FS_BASE}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer owner' },
  });
  return res.status;
}

/** The exact app operation: upsert on websiteSettings/general (create or update). */
async function userUpsertSettings(idToken, docId) {
  const res = await fetch(`${FS_BASE}/websiteSettings/${docId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      fields: {
        brandName: { stringValue: 'Sovik Jewels' },
        whatsappNumber: { stringValue: '+919000000000' },
      },
    }),
  });
  return res.status;
}

async function publicReadSettings() {
  const res = await fetch(`${FS_BASE}/websiteSettings/general`);
  return res.status;
}

const results = [];
function check(name, actual, expected) {
  const pass = actual === expected;
  results.push(`${pass ? 'PASS' : 'FAIL'} | ${name} | expected HTTP ${expected}, got ${actual}`);
}

// --- Fixture: active super_admin profile exists ---
const admin = await signUp(1);
await adminWriteDoc(`users/${admin.uid}`, {
  role: { stringValue: 'super_admin' },
  isActive: { booleanValue: true },
  name: { stringValue: 'Test Admin' },
  email: { stringValue: 'rules-test-1@sovik.test' },
});

check(
  'active super_admin CAN create websiteSettings/general (setDoc merge, doc missing)',
  await userUpsertSettings(admin.idToken, 'general'),
  200
);
check(
  'active super_admin CAN update websiteSettings/general (setDoc merge, doc exists)',
  await userUpsertSettings(admin.idToken, 'general'),
  200
);
check('public CAN read websiteSettings/general (storefront display)', await publicReadSettings(), 200);

// --- Fixture: active staff profile (not admin) ---
const staff = await signUp(2);
await adminWriteDoc(`users/${staff.uid}`, {
  role: { stringValue: 'staff' },
  isActive: { booleanValue: true },
  name: { stringValue: 'Test Staff' },
  email: { stringValue: 'rules-test-2@sovik.test' },
});
check(
  'active staff CANNOT write websiteSettings (role not admin/super_admin)',
  await userUpsertSettings(staff.idToken, 'staff-attempt'),
  403
);

// --- Fixture: INACTIVE super_admin profile ---
const inactive = await signUp(3);
await adminWriteDoc(`users/${inactive.uid}`, {
  role: { stringValue: 'super_admin' },
  isActive: { booleanValue: false },
  name: { stringValue: 'Inactive Admin' },
  email: { stringValue: 'rules-test-3@sovik.test' },
});
check(
  'INACTIVE super_admin CANNOT write websiteSettings (isActive != true)',
  await userUpsertSettings(inactive.idToken, 'inactive-attempt'),
  403
);

// --- Fixture: authenticated user with NO users/{uid} profile (the reported bug) ---
const ghost = await signUp(4);
check(
  'authenticated user WITHOUT users/{uid} profile CANNOT write websiteSettings (reported bug)',
  await userUpsertSettings(ghost.idToken, 'ghost-attempt'),
  403
);

// --- Unauthenticated write ---
const anon = await fetch(`${FS_BASE}/websiteSettings/anon`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: { brandName: { stringValue: 'hacker' } } }),
});
check('unauthenticated request CANNOT write websiteSettings', anon.status, 403);

// --- Cleanup fixtures ---
await adminDeleteDoc(`users/${admin.uid}`);
await adminDeleteDoc(`users/${staff.uid}`);
await adminDeleteDoc(`users/${inactive.uid}`);
await adminDeleteDoc('websiteSettings/general');
await adminDeleteDoc('websiteSettings/staff-attempt');
await adminDeleteDoc('websiteSettings/inactive-attempt');
await adminDeleteDoc('websiteSettings/ghost-attempt');

console.log('\n===== FIRESTORE RULES EMULATOR TEST RESULTS =====');
results.forEach((r) => console.log(r));
const failed = results.filter((r) => r.startsWith('FAIL')).length;
console.log(`===== ${results.length - failed}/${results.length} passed =====`);
process.exit(failed ? 1 : 0);
