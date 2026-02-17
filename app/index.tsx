import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  // ⏳ Still resolving auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🚫 Not logged in
  if (!user) {
    return <Redirect href="/login" />;
  }

  // ✅ Logged in
  return <Redirect href="/(tabs)/dashboard" />;
}
