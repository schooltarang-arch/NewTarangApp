import { Tabs, Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();

  // ⏳ Still checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🚫 Not logged in → go to login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // ✅ Logged in → show tabs
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="payment"
        options={{ title: 'Payment' }}
      />
    </Tabs>
  );
}
