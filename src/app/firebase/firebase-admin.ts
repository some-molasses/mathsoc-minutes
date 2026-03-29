// lib/firebaseAdmin.ts
import dotenv from "dotenv";
import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp(): App {
  // If already initialized, return existing app
  if (getApps().length > 0) {
    return getApp();
  }

  dotenv.config();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!privateKey) {
    throw new Error(
      "Missing Firebase Admin environment variables. " +
        "Check FIREBASE_PROJECT_ID.",
    );
  }

  if (!clientEmail) {
    throw new Error(
      "Missing Firebase Admin environment variables. " +
        "Check FIREBASE_CLIENT_EMAIL.",
    );
  }

  if (!projectId) {
    throw new Error(
      "Missing Firebase Admin environment variables. " +
        "Check FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Critical: .env files escape \n as \\n — this undoes that
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

// Call once at module level — safe due to the guard above
getFirebaseAdminApp();

export const firestore: Firestore = getFirestore();
