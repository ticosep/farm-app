import firebase from "firebase/app";
import "firebase/database";
import "firebase/storage";
import "firebase/auth";

// Export all the need references to the firebase
const config = {
  apiKey: "AIzaSyC1zzJ2OpNg_oQ8_ugd9EFem-qPGftLUgg",
  authDomain: "farm-app-87f99.firebaseapp.com",
  databaseURL: "https://farm-app-87f99.firebaseio.com",
  projectId: "farm-app-87f99",
  storageBucket: "farm-app-87f99.appspot.com",
  messagingSenderId: "1030131638836",
  appId: "1:1030131638836:web:df25168cc3d49673e8a061",
  measurementId: "G-WPRDQZGVP0",
};

const app = firebase.initializeApp(config);
const database = app.database();
const storageRef = app.storage().ref();

export { app, database, storageRef };
