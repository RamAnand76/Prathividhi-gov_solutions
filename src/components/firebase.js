// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyAts3LVUqv9SHx3OoL5k2SBONft8LudGdY",
    authDomain: "prathividhi.firebaseapp.com",
    databaseURL: "https://prathividhi-default-rtdb.firebaseio.com",
    projectId: "prathividhi",
    storageBucket: "prathividhi.appspot.com",
    messagingSenderId: "784454293835",
    appId: "1:784454293835:web:5a982a432e63d995d170ce",
    measurementId: "G-HHENQX7PJL"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };