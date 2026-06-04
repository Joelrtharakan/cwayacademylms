import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard"];

// Role-based route guards
const ROLE_GUARDS: Record<string, string[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/instructor": ["INSTRUCTOR", "ADMIN"],
  "/dashboard/student": ["STUDENT", "INSTRUCTOR", "ADMIN"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route requires auth
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  // Get session
  const session = await auth();

  // Not signed in → redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const userRole = (session.user as { role?: string }).role ?? "STUDENT";

  for (const [guardPath, allowedRoles] of Object.entries(ROLE_GUARDS)) {
    if (pathname.startsWith(guardPath)) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect to their own dashboard
        const dashMap: Record<string, string> = {
          ADMIN: "/dashboard/admin",
          INSTRUCTOR: "/dashboard/instructor",
          STUDENT: "/dashboard/student",
        };
        return NextResponse.redirect(new URL(dashMap[userRole] ?? "/login", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
