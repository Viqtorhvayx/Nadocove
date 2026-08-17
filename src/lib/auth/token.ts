import crypto from "node:crypto";

/**
 * Stateless signed tokens (HMAC-SHA256) for both the short-lived SIWE
 * nonce and the session cookie — no session table, no extra auth
 * dependency. Rotating AUTH_SECRET invalidates every outstanding token.
 */

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set — see .env.example.");
  return secret;
}

export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const exp = Date.now() + ttlSeconds * 1000;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyToken<T extends Record<string, unknown>>(
  token: string | undefined,
): (T & { exp: number }) | undefined {
  if (!token) return undefined;
  const [body, signature] = token.split(".");
  if (!body || !signature) return undefined;

  const expected = crypto.createHmac("sha256", getSecret()).update(body).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof parsed.exp !== "number" || Date.now() > parsed.exp) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}
