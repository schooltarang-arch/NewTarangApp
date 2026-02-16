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
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("AUTH STATE:", firebaseUser);

    if (!firebaseUser) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      setUser(firebaseUser);

      const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));

  if (docSnap.exists()) {
    setRole(docSnap.data().role);
  } else {
    setRole("pending");
  }
      // Example role fetch (if you have one)
      // const roleDoc = await getDoc(...)
      // setRole(roleDoc.data()?.role ?? "parent");

      setLoading(false); // 🔥 THIS IS CRITICAL
    } catch (error) {
      console.log("Auth error:", error);
      setLoading(false); // 🔥 MUST ALSO BE HERE
    }
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
