"use client";

import { firebaseAuth } from "../firebase/firebase";
import { signInWithGooglePopup, signOutUser } from "../firebase/firebase-auth";

export default function Admin() {
  return (
    <main>
      <button onClick={signInWithGooglePopup}>sign in</button>
      <button onClick={signOutUser}>sign out</button>
      <button
        onClick={() => {
          console.log(firebaseAuth.currentUser);
        }}
      >
        log current user
      </button>
    </main>
  );
}
