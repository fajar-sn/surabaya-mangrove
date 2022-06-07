// Get a RTDB instance
import firebase from 'firebase/app'
import 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBYQ4tAjfdhPeytT2pUav0dNLgM3CYeEeA',
  authDomain: 'surabaya-mangrove.firebaseapp.com',
  databaseURL: 'https://surabaya-mangrove-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'surabaya-mangrove',
  storageBucket: 'surabaya-mangrove.appspot.com',
  messagingSenderId: '372336801484',
  appId: '1:372336801484:web:dce3e5e49518b83545b469'
}

export const realtimeDatabase = firebase
  .initializeApp(firebaseConfig)
  .database()
