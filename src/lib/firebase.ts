import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUKaMMqJU-A7PB4acisttkKIeKitcLWs4",
  authDomain: "gitpilotai.firebaseapp.com",
  projectId: "gitpilotai",
  storageBucket: "gitpilotai.firebasestorage.app",
  messagingSenderId: "291990486685",
  appId: "1:291990486685:web:fc7002347a5f6a681d5e74"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
