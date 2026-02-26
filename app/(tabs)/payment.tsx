import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig';
import { useStripe } from '@stripe/stripe-react-native';


type MonthlyPayment = {
  id: string;
  month: string;
  baseAmount: number;
  finalAmount: number;
  status: string;
  discountApplied: number;
  halfMonthApplied: boolean;
};

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;

    const fetchPayments = async () => {
      const q = query(
        collection(db, 'monthlyPayments'),
        where('studentId', '==', id),
        where('parentId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MonthlyPayment[];

      // Sort latest month first
      data.sort((a, b) => b.month.localeCompare(a.month));

      setPayments(data);
      setLoading(false);
    };

    fetchPayments();
  }, [id, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (payments.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No payment records found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payments</Text>

      {payments.map(payment => {
        const statusColor =
          payment.status === 'paid'
            ? '#2e7d32'
            : payment.status === 'pending'
            ? '#ed6c02'
            : '#d32f2f';

        return (
          <View key={payment.id} style={styles.card}>
            <Text style={styles.month}>{payment.month}</Text>

            {/* Amount Section */}
            <View style={styles.amountRow}>
              {(payment.discountApplied > 0 || payment.halfMonthApplied) ? (
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

            {payment.discountApplied > 0 && (
              <Text style={styles.discount}>
                Family Discount Applied
              </Text>
            )}

            {payment.halfMonthApplied && (
              <Text style={styles.discount}>
                Half Month Applied
              </Text>
            )}

            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>
                {payment.status.toUpperCase()}
              </Text>
            </View>

            {payment.status !== 'paid' && (
              <Pressable
  style={styles.payButton}
onPress={async () => {
  try {
    const functions = getFunctions(app, "us-central1");
    const createPaymentIntent = httpsCallable(
      functions,
      "createPaymentIntent"
    );

    const result: any = await createPaymentIntent({
      paymentId: payment.id,
    });

    const clientSecret = result.data.clientSecret;
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Tarang Academy",
    });

    if (initError) {
      console.log(initError);
      alert("Payment initialization failed");
      return;
    }

    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      console.log(presentError);
      alert("Payment cancelled");
      return;
    }

    alert("Payment successful 🎉");

  } catch (error) {
    console.log(error);
    alert("Payment failed");
  }
}}

>
  <Text style={styles.payButtonText}>
    Pay Now
  </Text>
</Pressable>

            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  month: {
    fontWeight: '700',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  strikedAmount: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#999',
  },
  finalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
  },
  discount: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  payButton: {
    marginTop: 15,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
