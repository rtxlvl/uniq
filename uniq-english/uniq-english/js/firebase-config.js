// Firebase Configuration and Initialization
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCccTzSE6CFL_muKGWpcJwxY9Plxr4eP8k",
    authDomain: "uniq-english.firebaseapp.com",
    projectId: "uniq-english",
    storageBucket: "uniq-english.firebasestorage.app",
    messagingSenderId: "955092398744",
    appId: "1:955092398744:web:9aad07f1dd298c3ffb96ed",
    measurementId: "G-LNL8VD7Y0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('Firebase initialized successfully');

// Export Firebase services
export {
    db,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
};