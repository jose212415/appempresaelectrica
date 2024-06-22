// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDNKGvFblgiDMVz7E_8huDKtkSD-7ykmpo",
    authDomain: "empresa-electrica-87e38.firebaseapp.com",
    projectId: "empresa-electrica-87e38",
    storageBucket: "empresa-electrica-87e38.appspot.com",
    messagingSenderId: "496709022694",
    appId: "1:496709022694:web:b6e47ecbfc7bcb7999dc27",
    measurementId: "G-NJPGB2667E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };