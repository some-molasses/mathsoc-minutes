import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import {
  initializeApp,
  cert,
  getApps,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

requireServerAdminApp();

export function requireServerAdminApp() {
  // Initialize Firebase Admin SDK if not already initialized
  if (getApps().length > 0) {
    return;
  }

  const serviceAccountString = process.env.SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error(`Service account unset`);
  }

  const serviceAccount = JSON.parse(serviceAccountString);

  initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
  });
}

export async function getSSRAuthenticatedAppForUser() {
  const sessionCookie = (await cookies()).get("__session")?.value;

  if (!sessionCookie) {
    throw new Error("No session cookie found");
  }

  // Verify the session cookie using Admin SDK
  const decodedClaims = await getAuth().verifySessionCookie(
    sessionCookie,
    true,
  );

  return {
    firestore: getFirestore(),
    currentUser: decodedClaims,
    uid: decodedClaims.uid,
  };
}
