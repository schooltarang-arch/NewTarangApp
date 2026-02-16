import { View, Text, StyleSheet } from 'react-native';

export default function PendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Your account is pending admin approval.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
