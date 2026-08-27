import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App safely
let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase App initialization warning:", e);
  app = getApps()[0] || initializeApp(firebaseConfig);
}

// Initialize Cloud Firestore using database ID if specified
let dbInstance: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    dbInstance = getFirestore(app);
  }
} catch (e) {
  console.warn("Firestore custom database init error, falling back to default:", e);
  try {
    dbInstance = getFirestore(app);
  } catch (err) {
    console.error("Firestore initialization failed:", err);
  }
}

export const db = dbInstance!;
export default app;

