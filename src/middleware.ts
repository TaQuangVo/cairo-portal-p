import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes: string[] = ["/protected", "/dashboard/**"];
const adminRoutes: string[] = ["/dashboard/users"];

function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regexPattern = new RegExp(
      "^" + pattern
        .replace('/**', ".*")
        .replace('/*', "[^/]*") + "$"
    );
    return regexPattern.test(pathname);
  });
}

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req }) as { role?: string } | null;
  const { pathname } = req.nextUrl;

  const fullPath = req.nextUrl.pathname + req.nextUrl.search;

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (matchesPattern(pathname, protectedRoutes) && !token) {
    console.log("redirecting to login");
    return NextResponse.redirect(new URL("/login?redirect="+encodeURIComponent(fullPath), req.url));
  }

  if (matchesPattern(pathname, adminRoutes) && (!token || token.role !== "admin")) {
    return NextResponse.redirect(new URL("/login?redirect="+encodeURIComponent(fullPath), req.url));
  }

  return NextResponse.next();
}