import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

export type PaymentStatus = 'PAID' | 'DUE' | 'OVERDUE';

export type Payment = {
  month: string; // "YYYY-MM"
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paidDate?: string;
};

export type AttendanceRecord = {
  date: string;
  present: boolean;
};

export type Student = {
  id: string;
  personalId: string;
  firstName: string;
  lastName: string;
  className: string;
  payments: Payment[];
  attendance: AttendanceRecord[];
};

type PaymentContextType = {
  students: Student[];
  addStudent: (
    personalId: string,
    firstName: string,
    lastName: string,
    className: string,
    amount: number
  ) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  markAttendance: (id: string, present: boolean) => Promise<void>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);

  // 🔹 LOAD STUDENTS FROM FIRESTORE
  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, 'students'));

      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Student[];

      setStudents(data);
    };

    fetchStudents();
  }, []);

  // 🔹 ADD STUDENT
  const addStudent = async (
    personalId: string,
    firstName: string,
    lastName: string,
    className: string,
    amount: number
  ) => {
    // Prevent duplicate personalId
    const q = query(
      collection(db, 'students'),
      where('personalId', '==', personalId)
    );

    const existing = await getDocs(q);

    if (!existing.empty) {
      throw new Error('Student with this personal number already exists');
    }

    const today = new Date();
    const monthKey = today.toISOString().slice(0, 7);
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      5
    )
      .toISOString()
      .split('T')[0];

    const newStudent = {
      personalId,
      firstName,
      lastName,
      className,
      payments: [
        {
          month: monthKey,
          amount,
          dueDate,
          status: 'DUE' as PaymentStatus,
        },
      ],
      attendance: [],
    };

    const docRef = await addDoc(collection(db, 'students'), newStudent);

    setStudents(prev => [
      ...prev,
      { id: docRef.id, ...newStudent },
    ]);
  };

  // 🔹 MARK AS PAID
  const markAsPaid = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    const student = students.find(s => s.id === id);
    if (!student) return;

    const updatedPayments = student.payments.map(payment =>
      payment.month === currentMonth
        ? { ...payment, status: 'PAID' as PaymentStatus, paidDate: today }
        : payment
    );

    await updateDoc(doc(db, 'students', id), {
      payments: updatedPayments,
    });

    setStudents(prev =>
      prev.map(s =>
        s.id === id ? { ...s, payments: updatedPayments } : s
      )
    );
  };

  // 🔹 MARK ATTENDANCE
  const markAttendance = async (id: string, present: boolean) => {
    const today = new Date().toISOString().split('T')[0];

    const student = students.find(s => s.id === id);
    if (!student) return;

    const existingIndex = student.attendance.findIndex(
      record => record.date === today
    );

    let updatedAttendance: AttendanceRecord[];

    if (existingIndex !== -1) {
      updatedAttendance = [...student.attendance];
      updatedAttendance[existingIndex] = { date: today, present };
    } else {
      updatedAttendance = [
        ...student.attendance,
        { date: today, present },
      ];
    }

    await updateDoc(doc(db, 'students', id), {
      attendance: updatedAttendance,
    });

    setStudents(prev =>
      prev.map(s =>
        s.id === id ? { ...s, attendance: updatedAttendance } : s
      )
    );
  };

  return (
    <PaymentContext.Provider
      value={{ students, addStudent, markAsPaid, markAttendance }}
    >
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
