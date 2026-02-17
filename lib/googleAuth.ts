import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'https://auth.expo.io/@schooltarang/tarang',
    androidClientId: '165713778974-8i0qhrcu82b4eedto6u0ticb881titvd.apps.googleusercontent.com',
    webClientId: '165713778974-8m3s4ml2gau42jd76hvaj0agrahisja4.apps.googleusercontent.com',
  });

  return { request, response, promptAsync };
}
