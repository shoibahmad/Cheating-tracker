import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "eval-448ac.firebaseapp.com",
    projectId: "eval-448ac",
    storageBucket: "eval-448ac.firebasestorage.app",
    messagingSenderId: "998333220881",
    appId: "1:998333220881:web:4d5522381e5b2f730749b0",
    measurementId: "G-05Z74GNPV4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
