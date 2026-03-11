import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBN9A5_iFxKmdUDRpe0rdKUhcdrpApkkns",
  authDomain: "itali-store.firebaseapp.com",
  projectId: "itali-store",
  storageBucket: "itali-store.firebasestorage.app",
  messagingSenderId: "480720859344",
  appId: "1:480720859344:web:398a884479b98763862ed5",
  measurementId: "G-XZTBYGE6N9"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };