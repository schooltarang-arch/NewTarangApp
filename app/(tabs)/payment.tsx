import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePayment } from '../../context/PaymentContext';
import { useMemo } from 'react';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, markAsPaid } = usePayment();

  const student = useMemo(
    () => students.find(s => s.id === id),
    [students, id]
  );

  if (!student) {
    return (
      <View style={styles.container}>
        <Text>Student not found.</Text>
      </View>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  const currentPayment = student.payments?.find(
    p => p.month === currentMonth
  );

  if (!currentPayment) {
    return (
      <View style={styles.container}>
        <Text>No payment record for this month.</Text>
      </View>
    );
  }

  const statusColor =
    currentPayment.status === 'PAID'
      ? '#2e7d32'
      : currentPayment.status === 'DUE'
      ? '#ed6c02'
      : '#d32f2f';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <Text style={styles.subtitle}>
        {student.firstName} {student.lastName}
      </Text>

      <View style={styles.card}>
        <Text style={styles.amount}>
          {currentPayment.amount} SEK
        </Text>

        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>
            {currentPayment.status}
          </Text>
        </View>

        <Text style={styles.dueDate}>
          Due: {currentPayment.dueDate}
        </Text>

        {currentPayment.paidDate && (
          <Text style={styles.paidDate}>
            Paid: {currentPayment.paidDate}
          </Text>
        )}
      </View>

      {currentPayment.status !== 'PAID' && (
        <Pressable
          style={styles.payButton}
          onPress={() => markAsPaid(student.id)}
        >
          <Text style={styles.payButtonText}>
            Mark as Paid
          </Text>
        </Pressable>
      )}
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
  },
  subtitle: {
    marginBottom: 20,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  dueDate: {
    color: '#555',
  },
  paidDate: {
    marginTop: 4,
    color: '#2e7d32',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
