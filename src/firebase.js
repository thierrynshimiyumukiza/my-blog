import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBt_v49bpQ_f4ACwIqE8dg1uEBhTAEh2Fc",
  authDomain: "my-blog-fe90f.firebaseapp.com",
  projectId: "my-blog-fe90f",
  storageBucket: "my-blog-fe90f.appspot.com", // <-- corrected here
  messagingSenderId: "281157536307",
  appId: "1:281157536307:web:859e2693a736d6c2163146",
  measurementId: "G-QM8Y4XFRJ0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
