import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDwkmfRn7_GZwUslawEuWRYUvkceL96xNg",
    authDomain: "examinantt-ae432.firebaseapp.com",
    projectId: "examinantt-ae432",
    storageBucket: "examinantt-ae432.appspot.com",
    messagingSenderId: "121993344266",
    appId: "1:121993344266:web:5ba79677f952793351f6f3",
    measurementId: "G-2KK00MFTLC"
};

// Initialize Firebase
let app;
let auth: any;
let db: any;
let storage: any;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app, 'gs://examinantt-ae432.appspot.com');
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { auth, db, storage };
export default app;
