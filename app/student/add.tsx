import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { usePayment } from '../../context/PaymentContext';

export default function AddStudentScreen() {
  const [personalId, setPersonalId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [className, setClassName] = useState('');
  const [amount, setAmount] = useState('');

  const { addStudent } = usePayment();
  const router = useRouter();

  // 🔹 Validate Swedish Personal Number (YYYYMMDDXXXX)
  const validatePersonalId = (id: string) => {
    const cleaned = id.replace('-', '');
    const regex = /^[0-9]{12}$/;
    return regex.test(cleaned);
  };

  const handleAdd = async () => {
    const cleanedPersonalId = personalId.replace('-', '');

    if (!validatePersonalId(personalId)) {
      Alert.alert(
        'Invalid Personal Number',
        'Must be 12 digits (YYYYMMDDXXXX)'
      );
      return;
    }

    if (!firstName || !lastName || !className || !amount) {
      Alert.alert('Missing Fields', 'Please fill all fields');
      return;
    }

    try {
      await addStudent(
        cleanedPersonalId,
        firstName.trim(),
        lastName.trim(),
        className.trim(),
        Number(amount)
      );

      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Student</Text>

      <TextInput
        placeholder="Personal Number (YYYYMMDDXXXX)"
        value={personalId}
        onChangeText={setPersonalId}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />

      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />

      <TextInput
        placeholder="Class Name"
        value={className}
        onChangeText={setClassName}
        style={styles.input}
      />

      <TextInput
        placeholder="Monthly Fee (SEK)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Student</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
