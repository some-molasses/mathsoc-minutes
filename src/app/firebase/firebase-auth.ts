import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  const signInResult = await signInWithPopup(firebaseAuth, googleProvider);
  const user = signInResult.user;

  // Obtain Google credential for Google API
  const credential = GoogleAuthProvider.credentialFromResult(signInResult);

  // register with server
  const firebaseToken = await user.getIdToken();
  await fetch("/api/admin/auth/register-sign-in", {
    method: "POST",
    body: JSON.stringify({
      idToken: firebaseToken,
      googleToken: credential?.accessToken, // not yet used by server
    }),
  });

  return user;
}
export async function signOutUser() {
  await signOut(firebaseAuth);
}
