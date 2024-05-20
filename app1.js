// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
//import { getAnalytics } from "firebase/analytics";
//const { initializeApp }=require('firebase/app');
//const { getAuth, signInWithEmailAndPassword } =  require('firebase/auth');
//const axios = require('axios');
//const { getAnalytics }=require('firebase/analytics');
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAptM-WP5KRje_8PPERRvOYznizveOFDec",
  authDomain: "brg-flight-report.firebaseapp.com",
  projectId: "brg-flight-report",
  storageBucket: "brg-flight-report.appspot.com",
  messagingSenderId: "417616262955",
  appId: "1:417616262955:web:ffdeea7fff3675cdcaf76e",
  measurementId: "G-RZMBEV085Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
signInWithEmailAndPassword('smirciat@gmail.com','buttugly1').then(res=>{
  console.log(res);
}).catch(err=>{
  console.log(err);
});