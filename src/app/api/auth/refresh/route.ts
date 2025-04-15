import { encode, getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "./helper";

const JWT_NAME = process.env.NEXTAUTH_SESSION_TOKEN ?? "next-auth.session-token";

export async function GET (req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return Response.json({messages:'No token found!'}, {status: 401})
  }

  if (Date.now() > token.accessTokenExpiry) {
    return Response.json({messages:'Token expired'}, {status: 401})
  }

  const refreshed = await refreshAccessToken(token);

  if (refreshed.error) {
    return Response.json({messages:'Failed to refresh'}, {status: 401})
  }

  // Sign new JWT with updated token
  const signedJWT = await encode({
    token: refreshed,
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 60 * 60 * 24, // must match session maxAge
  });

  const response = NextResponse.json(
    { message: "Refreshed successfully" },
    { status: 200 }
  );

  // ✅ Set the cookie using NextResponse API
  response.cookies.set({
    name: JWT_NAME,
    value: signedJWT,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
