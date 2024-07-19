// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAts3LVUqv9SHx3OoL5k2SBONft8LudGdY",
  authDomain: "prathividhi.firebaseapp.com",
  projectId: "prathividhi",
  storageBucket: "prathividhi.appspot.com",
  messagingSenderId: "784454293835",
  appId: "1:784454293835:web:5a982a432e63d995d170ce",
  measurementId: "G-HHENQX7PJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth };

