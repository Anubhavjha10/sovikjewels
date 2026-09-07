import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
            // Authorization state is read strictly from the Firestore profile document.
            setStaffProfile(profile);
          } else {
            // SECURITY: no frontend authorization fallback. If the Firestore profile
            // document is missing, role stays null so no admin capability is granted
            // client-side (Firestore rules would reject admin writes anyway). The
            // profile must be created once in Firebase Console / via scripts/checkAdminProfile.mjs.
            setIsProfilePersistedInFirestore(false);
            setStaffProfile(null);
            console.warn(
              `[Sovik Auth] No profile document exists at users/${currentUser.uid}. ` +
              'Admin authorization is granted ONLY from Firestore, so this account cannot access the CMS until ' +
              'a document is created there with { role: "super_admin", isActive: true }. ' +
              'Create it in Firebase Console → Firestore Database → users collection (document ID = your Firebase Auth UID), ' +
              'or run: node scripts/checkAdminProfile.mjs <UID> <EMAIL> — then reload the page.'
            );
          }
        } catch (err) {
          // Read failure must NOT fall back to a client-side super_admin profile.
          setIsProfilePersistedInFirestore(false);
          setStaffProfile(null);
          console.error(
            `Error fetching staff profile (users/${currentUser.uid}). Admin authorization requires this document to be ` +
            'readable from Firestore with { role: "admin" | "super_admin", isActive: true }. No client-side fallback is applied.',
            err
          );
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
