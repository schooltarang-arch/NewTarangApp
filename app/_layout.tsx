import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { PaymentProvider } from '../context/PaymentContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaymentProvider>
    </AuthProvider>
  );
}
