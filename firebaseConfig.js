// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp, doc, setDoc } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyByZ4YaBjwGz7o7y324cjbd5W7M8LwWxaU",
  authDomain: "carevo-9c065.firebaseapp.com",
  projectId: "carevo-9c065",
  storageBucket: "carevo-9c065.appspot.com",
  messagingSenderId: "378050848361",
  appId: "1:378050848361:web:828ab1f3f06be9ffc3e4f8",
  measurementId: "G-F2CGJ50CC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, serverTimestamp, doc, setDoc };
