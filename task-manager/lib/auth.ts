import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function verifyAuth(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export function generateToken(payload: { id: string; email: string }): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
