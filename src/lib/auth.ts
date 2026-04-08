import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Role } from "./types";

const SECRET_KEY = process.env.JWT_SECRET || "default_development_secret_key_123";
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
}

export async function createSession(payload: { id: string, email: string, role: Role | any }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
    const c = await cookies();

    c.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession() {
    const c = await cookies();
    const session = c.get("session")?.value;
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(session, key);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function logout() {
    const c = await cookies();
    c.set("session", "", { expires: new Date(0) });
}
