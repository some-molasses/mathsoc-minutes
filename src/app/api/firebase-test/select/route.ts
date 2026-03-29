// app/api/motions/route.ts
import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { NextResponse } from "next/server";
import { FirebaseMotion } from "../route";

export async function GET() {
  const motionsCollectionRef = mathsocFirestore.collection("motions");
  const querySnapshot = await motionsCollectionRef
    .select("title")
    .where("title", "==", "Settlers of Catan")
    .get();

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
