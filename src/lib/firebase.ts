import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAF2ciHnFU0g2_X_VFQHwwnuW9Tpljg5Xc",
  authDomain: "sayed-1bfb6.firebaseapp.com",
  projectId: "sayed-1bfb6",
  storageBucket: "sayed-1bfb6.firebasestorage.app",
  messagingSenderId: "214297449520",
  appId: "1:214297449520:web:37a095335f619dd0e349f5",
  measurementId: "G-59LEQ186S6"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
