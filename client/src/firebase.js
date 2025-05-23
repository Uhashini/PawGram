// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4VmbHM8ylhYYp4mGOLJcfUmDPQEadMMA",
  authDomain: "pawgram-9b9a8.firebaseapp.com",
  projectId: "pawgram-9b9a8",
  storageBucket: "pawgram-9b9a8.firebasestorage.app",
  messagingSenderId: "873170979504",
  appId: "1:873170979504:web:55b4c8141d60199c5a8975",
  measurementId: "G-QBCD1QR842"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };