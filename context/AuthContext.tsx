import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import {
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';

import { auth } from '../lib/firebase';
import { db } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

/* ================= TYPES ================= */

type Role = 'admin' | 'parent' | 'pending' | null;

type AuthContextType = {
  user: any;
  role: Role;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Google Auth Request ---------- */

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      '165713778974-0uu7pmi9e64v5tnua05kethck10lggme.apps.googleusercontent.com',
    webClientId:
      '165713778974-8m3s4ml2gau42jd76hvaj0agrahisja4.apps.googleusercontent.com',
  });

  /* ---------- Handle Google → Firebase ---------- */

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;

    if (!idToken) {
      console.log('Google auth succeeded but no idToken found');
      return;
    }

    const credential = GoogleAuthProvider.credential(idToken);

    signInWithCredential(auth, credential).catch((err) =>
      console.log('Firebase sign-in error:', err)
    );
  }, [response]);

  /* ---------- Firebase Auth State ---------- */

  useEffect(() => {
    console.log('RAW GOOGLE RESPONSE:', response);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AUTH STATE:', firebaseUser);

      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setUser(firebaseUser);

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
          setRole(userDoc.data().role ?? 'parent');
        } else {
          setRole('pending');
        }
      } catch (error) {
        console.log('Auth error:', error);
        setRole('pending');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
    console.log('RAW GOOGLE RESPONSE:', response);
  }, []);

  /* ---------- Actions ---------- */

  const login = async () => {
    console.log('PROMPTING GOOGLE LOGIN');
    await promptAsync();
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  /* ---------- Provider ---------- */

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
