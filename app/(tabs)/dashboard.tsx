import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePayment } from '../../context/PaymentContext';
import ChildCard from '../../components/ChildCard';

export default function ParentDashboard() {
  const { students } = usePayment();
  const router = useRouter();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const totalChildren = students.length;

  const monthlyPayments = students.map(child =>
    child.payments?.find(p => p.month === currentMonth)
  );

  const totalAmount = monthlyPayments.reduce(
    (sum, payment) => sum + (payment?.amount ?? 0),
    0
  );

  const overdueCount = monthlyPayments.filter(
    payment => payment?.status === 'OVERDUE'
  ).length;

  const dueCount = monthlyPayments.filter(
    payment => payment?.status === 'DUE'
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Dashboard</Text>

        {/* Summary Section */}
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

        {/* Students List */}
        <View style={{ marginTop: 20 }}>
          {
            students.map((student : any)=> (
            <ChildCard
              key={student.id}
              id={student.id}
              name={`${student.firstName} ${student.lastName}`}
              className={student.className}
              payments={student.payments}
            />
            ))
          }
</View>


      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/student/add')}
      >
        <Text style={styles.fabText}>+</Text>
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
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
});
