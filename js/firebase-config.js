// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAZGAKEw0s684M6ZenPHUlF4wgl59AAVFs",
  authDomain: "thelivinglibrary-aa376.firebaseapp.com",
  projectId: "thelivinglibrary-aa376",
  storageBucket: "thelivinglibrary-aa376.firebasestorage.app",
  messagingSenderId: "49786538430",
  appId: "1:49786538430:web:f1f29ed21f83ba5f4411ef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
