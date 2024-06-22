// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
      apiKey: "AIzaSyApT9fF_wlafeTK0wsdt6LV_FnvZk-ZfKs",
      authDomain: "empresa-electrica-1f0b4.firebaseapp.com",
      projectId: "empresa-electrica-1f0b4",
      storageBucket: "empresa-electrica-1f0b4.appspot.com",
      messagingSenderId: "540595441999",
      appId: "1:540595441999:web:e55cd5c612a6aba00cf53a",
      measurementId: "G-1WMWB194T2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
