import CryptoJS from "crypto-js";

/**
 * Client-side encryption utilities for Garden Walk forms
 * Provides AES encryption with password-based key derivation
 */

export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv?: string; // Present in new format; absent in legacy data
}

export interface PasswordHashResult {
  hash: string;
  salt: string;
}

/**
 * Encrypts form data with a password.
 * Uses PBKDF2 for key derivation and AES-CBC with the derived key passed
 * as a WordArray (not a string) so CryptoJS uses it directly instead of
 * re-deriving via the weak EVP_BytesToKey path.
 */
export function encryptFormData(
  data: unknown,
  password: string,
): EncryptedData {
  const salt = CryptoJS.lib.WordArray.random(256 / 8).toString();
  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  // Pass key as WordArray + explicit IV so CryptoJS uses the key directly
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    iv,
  });

  return {
    encrypted: encrypted.toString(),
    salt,
    iv: iv.toString(),
  };
}

/**
 * Decrypts form data with a password.
 * Supports both the new format (with iv field) and the legacy format
 * (without iv, where key.toString() triggered EVP_BytesToKey).
 */
export function decryptFormData(
  encryptedData: EncryptedData,
  password: string,
): unknown {
  try {
    const key = CryptoJS.PBKDF2(password, encryptedData.salt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    let decrypted: CryptoJS.lib.WordArray;

    if (encryptedData.iv) {
      // New format: key as WordArray with explicit IV
      decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
      });
    } else {
      // Legacy format: key.toString() triggers EVP_BytesToKey
      decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key.toString());
    }

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      throw new Error("Invalid password or corrupted data");
    }

    return JSON.parse(decryptedString);
  } catch {
    throw new Error("Failed to decrypt form data. Please check your password.");
  }
}

/**
 * Creates a salted password hash for server-side storage.
 * Uses HMAC-SHA256 with a random salt to prevent rainbow table attacks.
 * Returns both the hash and salt so both can be stored.
 */
export function hashPasswordWithSalt(password: string): PasswordHashResult {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const hash = CryptoJS.HmacSHA256(password, salt).toString();
  return { hash, salt };
}

/**
 * Computes a password hash given the password and a known salt.
 * Used client-side before sending to the server for verification,
 * so the plaintext password never leaves the client.
 */
export function computePasswordHash(password: string, salt: string): string {
  return CryptoJS.HmacSHA256(password, salt).toString();
}

/**
 * Legacy: Hashes a password without salt (SHA-256).
 * Kept only for verifying passwords on artifacts that were created
 * before the salted hashing migration. Do not use for new artifacts.
 */
export function hashPasswordLegacy(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

/**
 * Verifies a password against a stored hash.
 * Supports both salted (new) and unsalted (legacy) hashes.
 */
export function verifyPasswordHash(
  passwordHash: string,
  storedHash: string,
): boolean {
  return passwordHash === storedHash;
}

/**
 * Legacy: Verifies a plaintext password against an unsalted SHA-256 hash.
 * Only used for backward compatibility with pre-migration artifacts.
 */
export function verifyPasswordLegacy(
  password: string,
  storedHash: string,
): boolean {
  return hashPasswordLegacy(password) === storedHash;
}

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with validation result (always valid for any non-empty password)
 */
export function validatePassword(password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
  };
  message: string;
} {
  // Accept any password that's not empty
  const isValid = password.length > 0;

  // Keep the same interface but mark all requirements as met
  const requirements = {
    minLength: true,
    hasUppercase: true,
    hasLowercase: true,
    hasNumber: true,
  };

  return {
    isValid,
    requirements,
    message: isValid ? "" : "Password cannot be empty",
  };
}

const cryptoUtils = {
  encryptFormData,
  decryptFormData,
  hashPasswordWithSalt,
  computePasswordHash,
  hashPasswordLegacy,
  verifyPasswordHash,
  verifyPasswordLegacy,
  validatePassword,
};

export default cryptoUtils;
