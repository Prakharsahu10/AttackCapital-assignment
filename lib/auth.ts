/**
 * Simple Authentication System
 * Temporary auth until Better-Auth is properly configured
 */

import { prisma } from "./db";
import bcrypt from "bcryptjs";

export interface AuthResult {
  success: boolean;
  user?: { id: string; email: string; name?: string };
  error?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name || undefined },
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

/**
 * Sign out
 */
export async function signOut(sessionToken: string): Promise<void> {
  await prisma.session
    .delete({
      where: { token: sessionToken },
    })
    .catch(() => {
      // Session might not exist
    });
}

/**
 * Get session by token
 */
export async function getSessionByToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export type Session = Awaited<ReturnType<typeof getSessionByToken>>;
