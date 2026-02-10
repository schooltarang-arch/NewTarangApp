import { View, Text, StyleSheet } from 'react-native';
import ChildCard from '../../components/ChildCard';

const parent = {
  name: 'Tarang Parent',
};

const children = [
  { id: '1', name: 'Aadhu', className: 'Bollywood Juniors', paymentStatus: 'PAID' },
  { id: '2', name: 'Arjun', className: 'Bollywood Kids', paymentStatus: 'DUE' },
];


export default function ParentDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {parent.name}</Text>

      <Text style={styles.section}>Your Children</Text>

      {children.map((child) => (
        <ChildCard
  key={child.id}
  name={child.name}
  className={child.className}
  paymentStatus={child.paymentStatus}
/>

      ))}
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
  section: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
});
