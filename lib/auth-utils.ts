import { cookies } from "next/headers";
import { getSessionByToken } from "./auth";
import { prisma } from "./db";

// Get the current authenticated user session

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("amd_auth_token");

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await getSessionByToken(sessionToken.value);
    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

// Get the current authenticated user details

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}

// Require user to be authenticated, throw error

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

// Check if user is authenticated

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}
