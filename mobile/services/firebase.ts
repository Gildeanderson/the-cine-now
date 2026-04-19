import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence,
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDP1vxqBl0DLBJsLsbtXPzMFhWrmzf99TU",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0221671134.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "gen-lang-client-0221671134",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0221671134.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "498203721265",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:498203721265:web:e2f5cdb9aebb77f9799f10"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export { 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
};
export type { User };
