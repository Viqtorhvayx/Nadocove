const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

// Reserved so nobody can claim an identity NadoCove's own UI might be
// mistaken for.
const RESERVED_USERNAMES = new Set([
  "admin",
  "nadocove",
  "nado",
  "support",
  "help",
  "api",
  "root",
  "null",
  "undefined",
  "settings",
  "dashboard",
]);

export type UsernameValidation = { ok: true } | { ok: false; error: string };

export function validateUsername(username: string): UsernameValidation {
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "3-20 characters: lowercase letters, numbers, and underscores only.",
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { ok: false, error: "That username is reserved." };
  }
  return { ok: true };
}
