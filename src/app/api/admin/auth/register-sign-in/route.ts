import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getAuth } from "firebase-admin/auth";
import { requireServerAdminApp } from "@/app/firebase/firebase-server";

requireServerAdminApp();

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    throw new Error(`No ID token given`);
  }

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await getAuth().createSessionCookie(idToken, {
    expiresIn,
  });

  // Get the cookies instance from Next.js headers
  const cookieStore = await cookies();

  // Set the session cookie as an HTTP-only, secure cookie
  cookieStore.set("__session", sessionCookie, {
    maxAge: expiresIn / 1000, // in seconds
    httpOnly: true, // Crucial for security: prevents client-side JavaScript access
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
    path: "/", // The cookie is valid for all paths in your application
    sameSite: "lax", // Protects against CSRF attacks
  });
}
