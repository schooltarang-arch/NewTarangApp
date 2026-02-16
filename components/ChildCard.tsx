import { Text, StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../firebase';


type Payment = {
  month: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'DUE' | 'OVERDUE';
  paidDate?: string;
};

type ChildProps = {
  id: string;
  name: string;
  className: string;
  payments: Payment[];
};

export default function ChildCard({ id, name, className, payments }: ChildProps) {
  const router = useRouter();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const currentPayment = payments?.find(
    p => p.month === currentMonth
  );

  const status = currentPayment?.status ?? 'DUE';

  const statusColor =
    status === 'PAID'
      ? '#2e7d32'
      : status === 'DUE'
      ? '#ed6c02'
      : '#d32f2f';

  const amount = currentPayment?.amount ?? 0;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/student/${id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>

        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <Text style={styles.className}>{className}</Text>

      <Text style={styles.amount}>
        {amount} SEK
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  className: {
    marginTop: 6,
    color: '#555',
  },
  amount: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
