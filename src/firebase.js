import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDDlx_ZDEn-7McjbyfVY4Eauux8X4Pwods",
    authDomain: "clone-netflix-bf201.firebaseapp.com",
    projectId: "clone-netflix-bf201",
    storageBucket: "clone-netflix-bf201.appspot.com",
    messagingSenderId: "457716720660",
    appId: "1:457716720660:web:0f4d60a8f9123385c27301"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();


export { auth };
export default db;