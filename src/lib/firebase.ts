// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL8O7zXbnvYEOMRxfRt3eLgJu1mAN--tc",
  authDomain: "thebestautoblog.firebaseapp.com",
  projectId: "thebestautoblog",
  storageBucket: "thebestautoblog.firebasestorage.app",
  messagingSenderId: "17768981589",
  appId: "1:17768981589:web:ba3dd4aaa3009e2af5a0dc",
  measurementId: "G-MX18M9MEYB"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export db
