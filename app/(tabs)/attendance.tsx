import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { usePayment } from '../../context/PaymentContext';

export default function AttendanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, markAttendance } = usePayment();

  const child = students.find(c => c.id === id);

  if (!child) {
    return (
      <View style={styles.container}>
        <Text>Child not found.</Text>
      </View>
    );
  }

  const totalClasses = child.attendance.length;
  const presentCount = child.attendance.filter(a => a.present).length;
  const percentage =
    totalClasses === 0
      ? 0
      : Math.round((presentCount / totalClasses) * 100);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Text style={styles.subtitle}>{child.firstName}</Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Overall Attendance</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.summaryText}>
          {presentCount} / {totalClasses} classes attended
        </Text>
      </View>

      {/* Action Buttons */}
      <Pressable
        style={styles.presentButton}
        onPress={() => markAttendance(child.id, true)}
      >
        <Text style={styles.buttonText}>Mark Present Today</Text>
      </Pressable>

      <Pressable
        style={styles.absentButton}
        onPress={() => markAttendance(child.id, false)}
      >
        <Text style={styles.buttonText}>Mark Absent Today</Text>
      </Pressable>

      {/* History Section */}
      <Text style={styles.historyTitle}>History</Text>

      {child.attendance.length === 0 ? (
        <Text style={styles.emptyText}>
          No attendance records yet.
        </Text>
      ) : (
        child.attendance
          .slice()
          .reverse()
          .map((record, index) => (
            <View key={index} style={styles.recordRow}>
              <Text style={styles.dateText}>{record.date}</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: record.present
                      ? '#2e7d32'
                      : '#d32f2f',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {record.present ? 'Present' : 'Absent'}
                </Text>
              </View>
            </View>
          ))
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
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 10,
  },
  percentage: {
    fontSize: 36,
    fontWeight: '800',
  },
  summaryText: {
    marginTop: 5,
    color: '#555',
  },
  presentButton: {
    backgroundColor: '#2e7d32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  absentButton: {
    backgroundColor: '#d32f2f',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  recordRow: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: '#777',
  },
});
