import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../lib/firebase';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

type Role = 'admin' | 'parent' | 'pending' | null;

type AuthContextType = {
  user: any;
  role: Role;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: '165713778974-8m3s4ml2gau42jd76hvaj0agrahisja4.apps.googleusercontent.com'
});


  useEffect(() => {
  console.log("GOOGLE RESPONSE:", response);

  if (response?.type === 'success') {
    console.log("Google success");

    const idToken = response.authentication?.idToken;
    console.log("ID TOKEN:", idToken);

    if (!idToken) {
      console.log("No idToken found");
      return;
    }

    const credential = GoogleAuthProvider.credential(idToken);

    signInWithCredential(auth, credential)
      .then(() => console.log("Firebase login success"))
      .catch((err) => console.log("Firebase login error:", err));
  }
}, [response]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("AUTH STATE:", firebaseUser);
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      if (adminDoc.exists()) {
        setRole('admin');
        setLoading(false);
        return;
      }

      const parentDoc = await getDoc(doc(db, 'parents', firebaseUser.uid));
      if (parentDoc.exists()) {
        setRole('parent');
        setLoading(false);
        return;
      }

      await setDoc(doc(db, 'pending_parents', firebaseUser.uid), {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        requestedAt: new Date().toISOString(),
      });

      setRole('pending');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    console.log("PROMPTING GOOGLE LOGIN");
    await promptAsync();
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
