import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"


const protectedRoutes = ["/protected", "/dashboard"];

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if(pathname === '/login' && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}