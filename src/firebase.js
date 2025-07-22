import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDsUfCaVbsRSGzFNvitW0OkZlCwqlceDxo",
  authDomain: "weatherapp-235b7.firebaseapp.com",
  databaseURL: "https://weatherapp-235b7-default-rtdb.firebaseio.com",
  projectId: "weatherapp-235b7",
  storageBucket: "weatherapp-235b7.firebasestorage.app",
  messagingSenderId: "477670986645",
  appId: "1:477670986645:web:9b55b1e21289892d43dc9c",
  measurementId: "G-SZPPRFSNTE"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const citiesCollection = collection(db, "savedCities");

// Export only what you need
export {
  app,
  auth,
  db,
  analytics,
  citiesCollection
};
