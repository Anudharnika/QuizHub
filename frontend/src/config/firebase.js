import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAebnW6o2k6T1bpsKwmra2PGuJbjuY24Lw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quizdeck-web.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quizdeck-web",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quizdeck-web.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "617217341064",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:617217341064:web:e03357d7ed5043c5a2d13d"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
