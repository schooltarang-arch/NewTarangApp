import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function PaymentScreen() {
  const { name, className, paymentStatus } = useLocalSearchParams<{
    name: string;
    className: string;
    paymentStatus: string;
  }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>

      <Text>Child: {name}</Text>
      <Text>Class: {className}</Text>
      <Text>Status: {paymentStatus}</Text>

      <Text style={styles.note}>
        (Real payments will be connected here)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  note: {
    marginTop: 20,
    color: '#555',
  },
});
