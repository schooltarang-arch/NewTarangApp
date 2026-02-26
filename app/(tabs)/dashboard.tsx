import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig';

type MonthlyPayment = {
  id: string;
  studentId: string;
  month: string;
  baseAmount: number;
  finalAmount: number;
  status: string;
  discountApplied: number;
  halfMonthApplied: boolean;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function ParentDashboard() {
  console.log("Dashboard mounted");
  const { logout, user, loading: authLoading } = useAuth();

  const router = useRouter();

  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }


    const fetchData = async () => {
      // 1️⃣ Fetch monthly payments
      const paymentsQuery = query(
        collection(db, 'monthlyPayments'),
        where('parentId', '==', user.uid),
        where('month', '==', currentMonth)
      );

      const paymentsSnap = await getDocs(paymentsQuery);

      const paymentsData = paymentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MonthlyPayment[];

      // 2️⃣ Fetch students
      const studentsQuery = query(
        collection(db, 'students'),
        where('parentId', '==', user.uid)
      );

      const studentsSnap = await getDocs(studentsQuery);

      const studentsData = studentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];

      setPayments(paymentsData);
      setStudents(studentsData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const totalChildren = payments.length;

  const totalAmount = payments.reduce(
    (sum, p) => sum + p.finalAmount,
    0
  );

  const overdueCount = payments.filter(
    p => p.status === 'overdue'
  ).length;

  const dueCount = payments.filter(
    p => p.status === 'pending'
  ).length;

  const generatePayments = async () => {
    try {
      const functions = getFunctions(app);
      const generateMonthlyPayments = httpsCallable(
        functions,
        'generateMonthlyPayments'
      );

      await generateMonthlyPayments({
        month: currentMonth,
        isHalfMonth: false,
      });

      alert('Monthly payments generated 🚀');
    } catch (error) {
      console.error(error);
      alert('Error generating payments');
    }
  };

  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
console.log("UID:", user.uid);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.title}>Dashboard</Text>

        <Pressable
          onPress={logout}
          style={{ alignSelf: 'flex-end', marginRight: 20 }}
        >
          <Text style={{ color: '#d32f2f', fontWeight: '600' }}>
            Logout
          </Text>
        </Pressable>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <SummaryCard label="Children" value={totalChildren.toString()} />
          <SummaryCard label="Total (SEK)" value={totalAmount.toString()} />
        </View>

        <View style={styles.summaryContainer}>
          <SummaryCard
            label="Overdue"
            value={overdueCount.toString()}
            color="#d32f2f"
          />
          <SummaryCard
            label="Due"
            value={dueCount.toString()}
            color="#ed6c02"
          />
        </View>

        {/* Payment Cards */}
        <View style={{ marginTop: 20 }}>
          {payments.map(payment => {
            const student = students.find(
              s => s.id === payment.studentId
            );

            return (
              <Pressable
                key={payment.id}
                style={styles.card}
                onPress={() =>
                  router.push(`/(tabs)/payment?id=${payment.studentId}`)
                }
              >
                <Text style={styles.studentName}>
                  {student
                    ? `${student.firstName} ${student.lastName}`
                    : 'Student'}
                </Text>

                <View style={styles.amountRow}>
                  {(payment.discountApplied > 0 ||
                    payment.halfMonthApplied) ? (
                    <>
                      <Text style={styles.strikedAmount}>
                        {payment.baseAmount} SEK
                      </Text>
                      <Text style={styles.finalAmount}>
                        {payment.finalAmount} SEK
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.finalAmount}>
                      {payment.finalAmount} SEK
                    </Text>
                  )}
                </View>

                <Text
                  style={{
                    marginTop: 6,
                    color:
                      payment.status === 'paid'
                        ? '#2e7d32'
                        : payment.status === 'pending'
                        ? '#ed6c02'
                        : '#d32f2f',
                    fontWeight: '600',
                  }}
                >
                  {payment.status.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={generatePayments}>
        <Text style={styles.fabText}>Generate</Text>
      </Pressable>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  color = '#111',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 5,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 20,
    elevation: 3,
  },
  studentName: {
    fontWeight: '700',
    fontSize: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  strikedAmount: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  finalAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
  },
  fabText: {
    color: '#fff',
    fontWeight: '600',
  },
});
