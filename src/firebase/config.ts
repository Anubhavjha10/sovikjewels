import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGFGp5U6AQAKFWxKoNf6uAaBdtMH8r3j0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sovik-jewels.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sovik-jewels",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sovik-jewels.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "804660328975",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:804660328975:web:989bbaf0374923e437417a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HWL4NNBC4P"
};

import { getFunctions } from 'firebase/functions';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// us-central1 is the deployed region for the Sovik Jewels Cloud Functions.
const functions = getFunctions(app, 'us-central1');

export { app, auth, db, functions };
