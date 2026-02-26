import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

  const firebaseConfig = {
    apiKey: "AIzaSyBmbribUy0U-0IpDpUwMewKf1RdCd_y08g",
    authDomain: "tarang-c2705.firebaseapp.com",
    projectId: "tarang-c2705",  
    storageBucket: "tarang-c2705.firebasestorage.app",
    messagingSenderId: "165713778974",
    appId: "1:165713778974:web:407c550f93f7b6a9b3110f"
  };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log("Firebase app initialized:", app);
console.log("Firestore DB:", db);


// // Function to fetch the document
// const getDocumentAsJson = async (collectionName, documentId) => {
//   try {
//     const docRef = doc(db, collectionName, documentId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       return docSnap.data();
//     } else {
//       return { error: "Document not found" };
//     }
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Example usage
// const fetchDocument = async () => {
//   const collection = "students";
//   const documentId = "130927-9162";

//   const result = await getDocumentAsJson(collection, documentId);
//   console.log(result);
// };

// fetchDocument();