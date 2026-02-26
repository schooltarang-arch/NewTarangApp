import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

export type Student = {
  id: string;
  personalId: string;
  firstName: string;
  lastName: string;
  className: string;
  parentId: string;
  active: boolean;
};

type PaymentContextType = {
  students: Student[];
  addStudent: (
    personalId: string,
    firstName: string,
    lastName: string,
    className: string
  ) => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);

  /* ================= LOAD STUDENTS ================= */

  useEffect(() => {
    if (!user) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      const q = query(
        collection(db, 'students'),
        where('parentId', '==', user.uid),
        where('active', '==', true)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Student[];

      setStudents(data);
    };

    fetchStudents();
  }, [user]);

  /* ================= ADD STUDENT ================= */

  const addStudent = async (
    personalId: string,
    firstName: string,
    lastName: string,
    className: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    // Prevent duplicate personalId for this parent
    const q = query(
      collection(db, 'students'),
      where('personalId', '==', personalId),
      where('parentId', '==', user.uid)
    );

    const existing = await getDocs(q);

    if (!existing.empty) {
      throw new Error('Student with this personal number already exists');
    }

    const newStudent = {
      personalId,
      firstName,
      lastName,
      className,
      parentId: user.uid,
      active: true,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'students'), newStudent);

    setStudents(prev => [
      ...prev,
      { id: docRef.id, ...newStudent } as Student,
    ]);
  };

  /* ================= PROVIDER ================= */

  return (
    <PaymentContext.Provider value={{ students, addStudent }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used inside PaymentProvider');
  }
  return context;
};
