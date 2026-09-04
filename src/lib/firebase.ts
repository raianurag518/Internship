import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your exact Firebase project configuration for studio-37370994-798b7
export const firebaseConfig = {
  apiKey: "AIzaSyAz_j1ae3xaDtR-uivH4aGNqJOBD8qw9Ho",
  authDomain: "studio-37370994-798b7.firebaseapp.com",
  projectId: "studio-37370994-798b7",
  storageBucket: "studio-37370994-798b7.firebasestorage.app",
  messagingSenderId: "497126823684",
  appId: "1:497126823684:web:fbd3f71d973a233fab2251"
};

// Initialize Firebase as a singleton instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

