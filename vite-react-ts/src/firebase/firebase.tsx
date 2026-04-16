import { initializeApp } from 'firebase/app';

import { GoogleAuthProvider, connectAuthEmulator, getAuth,onAuthStateChanged,signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";

import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// console.log('env: ', process.env)

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// emu
// if (process.env.NODE_ENV === 'development') {
if (import.meta.env.VITE_USE_EMU === 'yes') {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
}
// const db = getFirestore(app);

// // Get a list of cities from your database
// async function getCities(db) {
//   const citiesCol = collection(db, 'cities');
//   const citySnapshot = await getDocs(citiesCol);
//   const cityList = citySnapshot.docs.map(doc => doc.data());
//   return cityList;
// }
export const database = getDatabase(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});


export const signIn = (email:string, password:string) => signInWithEmailAndPassword(auth, email, password);
export const signIn2 = ()=> signInWithPopup(auth, googleAuthProvider);
export const onAuthStateChanged2 = (cb: any) => onAuthStateChanged(auth, cb);

export const db = getFirestore(app);

// emu
//if (process.env.NODE_ENV === 'development') {
if (import.meta.env.VITE_USE_EMU === 'yes') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

