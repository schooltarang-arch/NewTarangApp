import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBmbribUy0U-0IpDpUwMewKf1RdCd_y08g",
  authDomain: "tarang-c2705.firebaseapp.com",
  projectId: "tarang-c2705",
  storageBucket: "tarang-c2705.firebasestorage.app",
  messagingSenderId: "165713778974",
  appId: "1:165713778974:web:407c550f93f7b6a9b3110f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
