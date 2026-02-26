import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePayment } from '../../context/PaymentContext';

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students } = usePayment();
  const router = useRouter();

  const student = students.find(s => s.id === id);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text>Student not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {student.firstName} {student.lastName}
      </Text>

      <Text style={styles.subtitle}>
        Class: {student.className}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Student Info</Text>

        <Text>Personal ID: {student.personalId}</Text>
        <Text>Parent ID: {student.parentId}</Text>
        <Text>Status: {student.active ? 'Active' : 'Inactive'}</Text>
      </View>

      <Pressable
        style={styles.paymentButton}
        onPress={() =>
          router.push(`/(tabs)/payment?id=${student.id}`)
        }
      >
        <Text style={styles.buttonText}>Go to Payment</Text>
      </Pressable>
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
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 10,
  },
  paymentButton: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
