import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAmQHamSBBShD-lwhVdH3VtGiOVH2lU88",,
  authDomain: "trophe-4974e.firebaseapp.com",
  projectId: "trophe-4974e",
  storageBucket: "trophe-4974e.firebasestorage.app",
  messagingSenderId: "371454645448",
  appId: "1:371454645448:web:76193d1dd8a7ac2c7801fd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export async function signIntoTrophe() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }

  return auth.currentUser;
}
