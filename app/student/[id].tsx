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
  const { students, markAttendance } = usePayment();
  const router = useRouter();

  const student = students.find(s => s.id === id);

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

  const status = currentPayment?.status ?? 'DUE';

  const statusColor =
    status === 'PAID'
      ? '#2e7d32'
      : status === 'DUE'
      ? '#ed6c02'
      : '#d32f2f';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {student.firstName} {student.lastName}
      </Text>

      <Text style={styles.subtitle}>{student.className}</Text>

      {/* 🔹 Payment Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Current Payment</Text>

        {currentPayment ? (
          <>
            <Text style={styles.amount}>
              {currentPayment.amount} SEK
            </Text>

            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>{status}</Text>
            </View>

            <Text style={styles.dueDate}>
              Due: {currentPayment.dueDate}
            </Text>
          </>
        ) : (
          <Text>No payment record found.</Text>
        )}
      </View>

      {/* 🔹 Attendance Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Attendance</Text>

        {(() => {
          const total = (student.attendance ?? []).length
;
          const presentCount = (student.attendance ?? []).filter(
            r => r.present
          ).length;

          const percentage =
            total === 0
              ? 0
              : Math.round((presentCount / total) * 100);

          const today = new Date().toISOString().split('T')[0];
          const todayRecord = (student.attendance ?? []).find(
            r => r.date === today
          );

          return (
            <>
              <View style={{ marginBottom: 15 }}>
                <Text>Total Classes: {total}</Text>
                <Text>Present: {presentCount}</Text>
                <Text style={{ fontWeight: '700' }}>
                  Attendance: {percentage}%
                </Text>
              </View>

              <Text style={{ marginBottom: 10 }}>
                Today:{' '}
                {todayRecord
                  ? todayRecord.present
                    ? 'Present'
                    : 'Absent'
                  : 'Not marked'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  style={[
                    styles.attendanceButton,
                    { backgroundColor: '#2e7d32' },
                  ]}
                  onPress={() => markAttendance(student.id, true)}
                >
                  <Text style={styles.buttonText}>
                    Mark Present
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.attendanceButton,
                    { backgroundColor: '#d32f2f' },
                  ]}
                  onPress={() =>
                    markAttendance(student.id, false)
                  }
                >
                  <Text style={styles.buttonText}>
                    Mark Absent
                  </Text>
                </Pressable>
              </View>

              <View style={{ marginTop: 15 }}>
                {(student.attendance ?? []).map((record, index) => (
                  <Text key={index}>
                    {record.date} —{' '}
                    {record.present ? 'Present' : 'Absent'}
                  </Text>
                ))}
              </View>
            </>
          );
        })()}
      </View>

      {/* 🔹 Go To Payment */}
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
  amount: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  dueDate: {
    color: '#555',
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
  attendanceButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
