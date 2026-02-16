import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as AuthSession from "expo-auth-session";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "tarang",
});

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarang Academy</Text>

      <Pressable style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login with Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
