// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBARhFTno5zLZqhNsB-6qlmEVkZxM8ELiM",
  authDomain: "financify-e3e04.firebaseapp.com",
  projectId: "financify-e3e04",
  storageBucket: "financify-e3e04.firebasestorage.app",
  messagingSenderId: "528922958746",
  appId: "1:528922958746:web:53017477c0b3ca3864f823",
  measurementId: "G-0XTRCHX5BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export {db};