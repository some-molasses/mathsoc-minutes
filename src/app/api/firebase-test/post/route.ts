// app/api/motions/route.ts
import { firestore } from "@/app/firebase/firebase-admin";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const motionsCollectionRef = firestore.collection("motions");
  await motionsCollectionRef.add({
    id: randomUUID(),
    title: "Settlers of Catan",
  });

  // Return the data using NextResponse
  return NextResponse.json({}, { status: 200 });
}
