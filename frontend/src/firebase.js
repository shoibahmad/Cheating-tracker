import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "eval-6be19.firebaseapp.com",
    projectId: "eval-6be19",
    storageBucket: "eval-6be19.firebasestorage.app",
    messagingSenderId: "103669883499",
    appId: "1:103669883499:web:9352f790699d862c5f072e",
    measurementId: "G-8ZWSRX3KVQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
