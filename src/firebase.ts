import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9wyBMckVaM49KJ0olZmJSsE9PF1DaMm8",
  authDomain: "world-cup-2026-polla.firebaseapp.com",
  projectId: "world-cup-2026-polla",
  storageBucket: "world-cup-2026-polla.firebasestorage.app",
  messagingSenderId: "547949003852",
  appId: "1:547949003852:web:bab116f077bfe843c220e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
