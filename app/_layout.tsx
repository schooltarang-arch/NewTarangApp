import { Stack } from "expo-router";
import { PaymentProvider } from "../context/PaymentContext";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PaymentProvider>
    </AuthProvider>
  );
}
