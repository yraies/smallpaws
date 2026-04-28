import { timingSafeEqual } from "node:crypto";
import { hashPasswordLegacy } from "./crypto";

function timingSafeStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, Buffer.alloc(leftBuffer.length));
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyPasswordHashSecure(
  passwordHash: string,
  storedHash: string,
): boolean {
  return timingSafeStringEqual(passwordHash, storedHash);
}

export function verifyPasswordLegacySecure(
  password: string,
  storedHash: string,
): boolean {
  return timingSafeStringEqual(hashPasswordLegacy(password), storedHash);
}
