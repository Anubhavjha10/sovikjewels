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
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setStaffProfile(userDocSnap.data() as StaffUser);
          } else {
            // First user or missing profile fallback: initialize as super_admin
            const initialProfile: StaffUser = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin',
              email: currentUser.email || '',
              role: 'super_admin',
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, { ...initialProfile, createdAt: serverTimestamp() });
            setStaffProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error fetching staff profile:', err);
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
