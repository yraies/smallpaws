import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ENCRYPTION_PREFIX = "gwenc:v1:";
const DEV_FALLBACK_KEY = "garden-walk-dev-master-key";

function getMasterKey(): Buffer {
  const secret = process.env.ARTIFACT_ENCRYPTION_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ARTIFACT_ENCRYPTION_KEY is required in production");
    }

    return createHash("sha256").update(DEV_FALLBACK_KEY).digest();
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptStoredString(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getMasterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${Buffer.from(
    JSON.stringify({
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      data: encrypted.toString("base64"),
    }),
  ).toString("base64")}`;
}

export function decryptStoredString(value: string): string {
  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const payload = JSON.parse(
    Buffer.from(value.slice(ENCRYPTION_PREFIX.length), "base64").toString("utf8"),
  ) as {
    iv: string;
    tag: string;
    data: string;
  };

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getMasterKey(),
    Buffer.from(payload.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
