// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Ganti nilai di bawah ini dengan config dari Firebase Console Anda
const firebaseConfig = {
  apiKey: "AIzaSyDwbjrxg6lmZDI2c2DZyXj2PSqR4URb4XE",
  authDomain: "portfolio-web-5896c.firebaseapp.com",
  projectId: "portfolio-web-5896c",
  storageBucket: "portfolio-web-5896c.firebasestorage.app",
  messagingSenderId: "679628326487",
  appId: "1:679628326487:web:6bea767aa7235d41ec8512",
  measurementId: "G-KD6G900QB1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan yang akan kita gunakan
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);