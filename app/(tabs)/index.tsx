import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  console.log("ROOT INDEX LOADED");
  return <Redirect href="/(tabs)/dashboard" />;
}


