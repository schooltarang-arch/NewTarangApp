import { Slot } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '../context/AuthContext';
import { PaymentProvider } from '../context/PaymentContext';

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51T2LI9CSb224SGauCXd2WM1VfZH1dN9HayjFEjEqPpgDm8vuQXgX7fhgYJRCEgGo2SICF8wat9NHNJsDVLvwttjI000qLWlYzM"
      merchantIdentifier="merchant.com.tarang"
    >
      <AuthProvider>
        <PaymentProvider>
          <Slot />
        </PaymentProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
