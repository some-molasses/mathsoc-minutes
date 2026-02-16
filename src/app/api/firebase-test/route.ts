// app/api/motions/route.ts
import { getSSRAuthenticatedAppForUser } from "@/app/firebase/firebase-server";
import { NextResponse } from "next/server";

// Define the type for your motion data
interface FirebaseMotion {
  id: string;
  // Add other fields present in your 'motions' collection
  name?: string; // Example field
  description?: string; // Example field
}

export async function GET() {
  const { firestore } = await getSSRAuthenticatedAppForUser();

  const motionsCollectionRef = firestore.collection("motions");
  const querySnapshot = await motionsCollectionRef.get();

  const motions: FirebaseMotion[] = [];
  querySnapshot.forEach((doc) => {
    motions.push({
      id: doc.id,
      ...doc.data(),
    } as FirebaseMotion);
  });

  // Return the data using NextResponse
  return NextResponse.json(motions, { status: 200 });
}
