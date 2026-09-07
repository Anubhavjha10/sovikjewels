import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { StaffUser, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  staffProfile: StaffUser | null;
  loading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  isProfilePersistedInFirestore: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffUser | null>(null);
  const [isProfilePersistedInFirestore, setIsProfilePersistedInFirestore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const profile = userDocSnap.data() as StaffUser;
            setIsProfilePersistedInFirestore(true);
            if (profile.role !== 'super_admin' && profile.role !== 'admin') {
              console.warn(
                `[Sovik Auth] Profile users/${currentUser.uid} has role "${profile.role}". ` +
                'Firestore rules only allow role "admin" or "super_admin" to write Website Settings.'
              );
            } else if (profile.isActive !== true) {
              console.warn(
                `[Sovik Auth] Profile users/${currentUser.uid} is inactive (isActive: ${profile.isActive}). ` +
                'Set isActive to true in Firestore to enable admin writes such as Business Settings updates.'
              );
            }
            setStaffProfile(profile);
          } else {
            setIsProfilePersistedInFirestore(false);
            // First user or missing profile fallback: initialize as super_admin
            const initialProfile: StaffUser = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
              email: currentUser.email || '',
              role: 'super_admin',
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            console.warn(
              `[Sovik Auth] No profile document exists at users/${currentUser.uid}. The UI falls back to super_admin, ` +
              'but Firestore rules reject admin writes (including Business Settings updates) until this document exists ' +
              'with { role: "super_admin", isActive: true }. Create it once in Firebase Console → Firestore Database → users collection (document ID = your Firebase Auth UID).'
            );
            try {
              await setDoc(userDocRef, { ...initialProfile, createdAt: serverTimestamp() });
              setIsProfilePersistedInFirestore(true);
            } catch {
              // Expected if firestore rules prevent un-bootstrapped writes
              setIsProfilePersistedInFirestore(false);
            }
            setStaffProfile(initialProfile);
          }
        } catch (err) {
          setIsProfilePersistedInFirestore(false);
          console.error(
            `Error fetching/registering staff profile (users/${currentUser.uid}). ` +
            'Admin writes such as Business Settings updates will be rejected by Firestore rules until a valid profile document exists with { role: "admin" | "super_admin", isActive: true }.',
            err
          );
          // Fallback profile for authenticated user
          setStaffProfile({
            uid: currentUser.uid,
            name: currentUser.email?.split('@')[0] || 'Admin',
            email: currentUser.email || '',
            role: 'super_admin',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setStaffProfile(null);
        setIsProfilePersistedInFirestore(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setStaffProfile(null);
    setIsProfilePersistedInFirestore(false);
  };

  const role = staffProfile?.role || null;
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = isSuperAdmin || role === 'admin';
  const isStaff = Boolean(role && staffProfile?.isActive);

  return (
    <AuthContext.Provider
      value={{
        user,
        staffProfile,
        loading,
        role,
        isAdmin,
        isSuperAdmin,
        isStaff,
        isProfilePersistedInFirestore,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
