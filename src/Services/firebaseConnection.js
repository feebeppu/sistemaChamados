import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB_GvSOZiJWtoyCoMc7u7YPHQvV_eWGHXE",
    authDomain: "tickets-aa45d.firebaseapp.com",
    projectId: "tickets-aa45d",
    storageBucket: "tickets-aa45d.appspot.com",
    messagingSenderId: "138213794684",
    appId: "1:138213794684:web:29ef54fed303111a51faf9",
    measurementId: "G-R65ML1LEF6"
  };

  const firebaseApp = initializeApp(firebaseConfig)

  const auth = getAuth(firebaseApp)
  const db = getFirestore(firebaseApp)
  const storage = getStorage(firebaseApp)

  export { auth, db, storage }