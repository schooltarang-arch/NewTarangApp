import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

type ChildProps = {
  name: string;
  className: string;
  paymentStatus: 'PAID' | 'DUE' | 'OVERDUE';
};

export default function ChildCard({ name, className, paymentStatus }: ChildProps) {
  const router = useRouter();

  const statusColor =
    paymentStatus === 'PAID'
      ? '#2e7d32'
      : paymentStatus === 'DUE'
      ? '#ed6c02'
      : '#d32f2f';

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
  router.push({
    pathname: '/payment',
    params: {
      name,
      className,
      paymentStatus,
    },
  })
}

    >
      <Text style={styles.childName}>{name}</Text>
      <Text style={styles.className}>{className}</Text>
      <Text style={[styles.status, { color: statusColor }]}>
        Payment: {paymentStatus}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
  },
  className: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
