import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sql } from "./db";
import type { Client } from "./types";
import { normalizeName, normalizePhone } from "./format";

const CLIENT_COOKIE = "fidelio_client";
const ADMIN_COOKIE = "fidelio_admin";

function secretKey() {
  const secret =
    process.env.SESSION_SECRET?.trim() ||
    "fidelio-dev-secret-change-me-in-production";
  return new TextEncoder().encode(secret);
}

export async function loginOrRegisterClient(name: string, phone: string) {
  const cleanName = normalizeName(name);
  const cleanPhone = normalizePhone(phone);

  if (cleanName.length < 2) {
    return { error: "Indiquez un nom d’au moins 2 caractères." as const };
  }
  if (cleanPhone.length < 8) {
    return { error: "Indiquez un numéro de téléphone valide." as const };
  }

  const existing = await sql<Client>(
    "SELECT * FROM clients WHERE phone = $1 LIMIT 1",
    [cleanPhone],
  );

  let client = existing[0];
  if (!client) {
    const id = `cl_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const created = await sql<Client>(
      `INSERT INTO clients (id, name, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, cleanName, cleanPhone],
    );
    client = created[0];
  } else if (client.name.toLowerCase() !== cleanName.toLowerCase()) {
    const updated = await sql<Client>(
      `UPDATE clients SET name = $1 WHERE id = $2 RETURNING *`,
      [cleanName, client.id],
    );
    client = updated[0];
  }

  await setClientSession(client.id);
  return { client };
}

export async function setClientSession(clientId: string) {
  const token = await new SignJWT({ role: "client", clientId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearClientSession() {
  const jar = await cookies();
  jar.delete(CLIENT_COOKIE);
}

export async function getCurrentClient(): Promise<Client | null> {
  const jar = await cookies();
  const token = jar.get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== "client" || typeof payload.clientId !== "string") {
      return null;
    }
    const rows = await sql<Client>("SELECT * FROM clients WHERE id = $1", [
      payload.clientId,
    ]);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function loginAdmin(pin: string) {
  const settings = await sql<{ admin_pin: string }>(
    "SELECT admin_pin FROM loyalty_settings WHERE id = 1",
  );
  const expected = settings[0]?.admin_pin ?? "2468";
  if (pin.trim() !== expected) {
    return { error: "Code PIN incorrect." as const };
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return { ok: true as const };
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
