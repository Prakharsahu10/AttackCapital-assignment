import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/* 
Handle all HTTP methods for auth endpoints 
*/

export async function GET(request: Request) {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/api/auth/signin") {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn(email, password);

    if (!result.success) {
      return NextResponse.redirect(new URL("/login?error=Invalid credentials", url), {
        status: 303,
      });
    }

    // Set session cookie
    const cookieStore = await cookies();
    const session = await prisma.session.findFirst({
      where: { userId: result.user!.id },
      orderBy: { createdAt: "desc" },
    });

    if (session) {
      cookieStore.set("amd_auth_token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return NextResponse.redirect(new URL("/", url), { status: 303 });
  }

  if (pathname === "/api/auth/signout") {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("amd_auth_token");

    if (sessionToken) {
      await signOut(sessionToken.value);
      cookieStore.delete("amd_auth_token");
    }

    return NextResponse.redirect(new URL("/login", url), { status: 303 });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
