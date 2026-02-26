import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { auth , db } from '../firebaseConfig';

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

  /* ---------- Prevent SSR issues ---------- */

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const googleConfig = useMemo(() => {
    // Prevent execution during SSR
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return null;
    }

    return {
      clientId:
        '165713778974-8m3s4ml2gau42jd76hvaj0agrahisja4.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
    };
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleConfig ?? {}
  );

  /* ---------- Handle Google → Firebase ---------- */

  useEffect(() => {
    if (response?.type !== 'success') return;

    const idToken =
      response.authentication?.idToken ??
      response.params?.id_token;

    if (!idToken) {
      console.log('No idToken returned from Google');
      return;
    }

    const credential = GoogleAuthProvider.credential(idToken);

    signInWithCredential(auth, credential).catch((err) =>
      console.log('Firebase sign-in error:', err)
    );
  }, [response]);

  /* ---------- Firebase Auth State ---------- */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
  }, []);

  /* ---------- Actions ---------- */

  const login = async () => {
    if (!request) return;
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
