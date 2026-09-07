/**
 * Sovik Jewels — Admin Profile Helper & Documentation Script
 * ==========================================================
 * This utility prints the exact Firestore document structure required to grant
 * super_admin or admin permissions under the production firestore.rules.
 *
 * Usage:
 *   node scripts/checkAdminProfile.mjs <USER_AUTH_UID> <USER_EMAIL>
 *
 * Example:
 *   node scripts/checkAdminProfile.mjs ABC123XYZ admin@sovikjewels.com
 */

const uid = process.argv[2];
const email = process.argv[3] || 'admin@sovikjewels.com';

console.log('====================================================');
console.log('SOVIK JEWELS — FIRESTORE ADMIN USER PROFILE SETUP');
console.log('====================================================\n');

if (!uid) {
  console.log('⚠️  No Firebase Auth UID provided.\n');
  console.log('To set up an admin user, find the User UID in:');
  console.log('Firebase Console → Authentication → Users tab (copy the UID column)\n');
  console.log('Then run:');
  console.log('  node scripts/checkAdminProfile.mjs <USER_AUTH_UID> <USER_EMAIL>\n');
  console.log('Or manually create the document in Firebase Console:\n');
} else {
  console.log(`Target User Auth UID : ${uid}`);
  console.log(`Target User Email    : ${email}\n`);
}

console.log('--- INSTRUCTIONS FOR FIREBASE CONSOLE ---');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select project: sovik-jewels');
console.log('3. Open "Firestore Database" from the left menu.');
console.log('4. Click on the "users" collection (or click "Start collection" with ID "users").');
console.log(`5. Click "Add document", set Document ID to: ${uid || '<YOUR_FIREBASE_AUTH_UID>'}`);
console.log('6. Add the following fields:');
console.log('   ------------------------------------------------------------');
console.log(`   Field: uid        | Type: string  | Value: "${uid || '<YOUR_FIREBASE_AUTH_UID>'}"`);
console.log(`   Field: email      | Type: string  | Value: "${email}"`);
console.log('   Field: name       | Type: string  | Value: "Admin"');
console.log('   Field: role       | Type: string  | Value: "super_admin"');
console.log('   Field: isActive   | Type: boolean | Value: true');
console.log('   ------------------------------------------------------------');
console.log('\nOnce created, reload the /admin/settings page. Business Settings will save successfully!\n');

