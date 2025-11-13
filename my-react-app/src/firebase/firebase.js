import { initializeApp } from 'firebase/app';

import { GoogleAuthProvider, connectAuthEmulator, getAuth,onAuthStateChanged,signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getDatabase } from "firebase/database";

import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// console.log('env: ', process.env)

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// emu
// if (process.env.NODE_ENV === 'development') {
if (process.env.REACT_APP_USE_EMU === 'true') {
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


export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signIn2 = ()=> signInWithPopup(auth, googleAuthProvider);
export const onAuthStateChanged2 = (cb) => onAuthStateChanged(auth, cb);

export const db = getFirestore(app);

// emu
//if (process.env.NODE_ENV === 'development') {
if (process.env.REACT_APP_USE_EMU === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

// database.ref('accounts')
// .orderByChild('account')
// .equalTo('khiemnv')
// .once('value')
// .then((snapshot)=>{
//   console.log(snapshot.val(), snapshot.key)
// })

// database.ref('accounts')
// .orderByKey()
// .equalTo('-Mv4vTyoIFohXi0Wc0HD')
// .once('value')
// .then((snapshot)=>{
//   console.log(snapshot.val(), snapshot.key)
// })

// database.ref('accounts').limitToFirst(2).once('value').then((snapshot)=>{
//   console.log(snapshot.val(), snapshot.key)
// })

// firebase.auth().signInWithEmailAndPassword(email, password)
//   .then((userCredential) => {
//     // Signed in
//     var user = userCredential.user;
//     // ...
//   })
//   .catch((error) => {
//     var errorCode = error.code;
//     var errorMessage = error.message;
//   });

// firebase.auth().createUserWithEmailAndPassword(email, password)
//   .then((userCredential) => {
//     // Signed in 
//     var user = userCredential.user;
//     console.log(user)
//     // ...
//   })
//   .catch((error) => {
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     console.log(errorMessage)
//     // ..
//   });

// database.ref('expenses').on('child_removed', (snapshot) => {
//   console.log(snapshot.val(), snapshot.key)
// });
// database.ref('expenses').on('child_changed', (snapshot) => {
//   console.log(snapshot.val(), snapshot.key)
// });
// database.ref('expenses').on('child_added', (snapshot) => {
//   console.log(snapshot.val(), snapshot.key)
// });

// database.ref('expenses')
//   .once('value')
//   .then((snapshot)=>{
//     const expenses = [];
//     snapshot.forEach((childSnapshot)=>{
//       expenses.push({
//         id: childSnapshot.key,
//         ...childSnapshot.val()
//       })
//     })

//     console.log(expenses);
//   });
// database.ref('expenses').push({
//   description: 'Rent',
//   note: '',
//   amount: 1000,
//   createAt: 9761234
// });

// database.ref('expenses').push({
//   description: 'coffee',
//   note: '',
//   amount: 1000,
//   createAt: 9761234
// });

// database.ref('expenses').push({
//   description: 'Food',
//   note: '',
//   amount: 1000,
//   createAt: 9761234
// });
// database.ref('notes').push({
//   title: 'todo',
//   body: 'go for a run'
// })

// database.ref('notes/-MtpL92VxHmjVbLAhwt2').update({
//   title: 'new title',
//   body: 'new body'
// })

// const firebasesNotes = {
//   notes: {
//     id: {
//       title: '',
//       body: ''
//     }
//   }
// }

// const notes = [{
//   id: '12',
//   title: 'first note',
//   body: 'this is my note'
// }, {
//   id: '132',
//   title: 'An other note',
//   body: 'this is my note'
// }]

// database.ref('notes').set(notes)
// const valueChange = database.ref().on('value', (snapshot)=>{
//   const val = snapshot.val();
//   console.log(`name: ${val.name}`);
// }, (e)=>{
//   console.log(e)
// });

// setTimeout(()=>{
//   database.ref('name').set('Ninh');
// }, 3500);

// setTimeout(()=>{
//   database.ref().off('value', valueChange);
// }, 3500);

// setTimeout(()=>{
//   database.ref('name').set('hai');
// }, 3500);

// database.ref('location')
// .once('value')
// .then((snapshot)=>{
//   const val = snapshot.val();
//   console.log(val);
// })
// .catch();

// database.ref().set({
//     name: 'Khiem',
//     age: 26,
//     isSingle: false,
//     job: {
//       title: 'IT',
//       company: 'Google'
//     },
//     location: {
//         city: 'Nagoya',
//         country: 'Japan'
//     }
// })

// database.ref('age').set(27);
// database.ref('location/city').set('Tokyo');
// database.ref('height').set('100');
// database.ref('attributes').set({
//   height: 100,
//   weight: 100
// }).then(()=>{
//   console.log('data is save')
// }).catch((e)=>{
//   console.log('this fail', e)
// });

// database.ref("isSingle")
//   .remove()
//   .then(()=>{
//     console.log('reomved')
//   })
//   .catch(()=>{
//     console.log('error')
//   });

  // database.ref('weight').set(null)
  // database.ref().update({
  //   'job/company': 'Amazon',
  //   'location/city': "Seatle"
  // })

