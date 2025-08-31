import CryptoJS from 'crypto-js';

/**
 * Client-side encryption utilities for Small Paws forms
 * Provides AES encryption with password-based key derivation
 */

export interface EncryptedData {
  encrypted: string;
  salt: string;
}

/**
 * Encrypts form data with a password
 * @param data - The data to encrypt (will be JSON.stringify'd)
 * @param password - The password to use for encryption
 * @returns Encrypted data object with salt
 */
export function encryptFormData(data: unknown, password: string): EncryptedData {
  // Generate a random salt for key derivation
  const salt = CryptoJS.lib.WordArray.random(256/8).toString();
  
  // Derive key from password and salt using PBKDF2
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 10000
  });
  
  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key.toString()).toString();
  
  return {
    encrypted,
    salt
  };
}

/**
 * Decrypts form data with a password
 * @param encryptedData - The encrypted data object
 * @param password - The password to use for decryption
 * @returns The decrypted data
 * @throws Error if decryption fails (wrong password or corrupted data)
 */
export function decryptFormData(encryptedData: EncryptedData, password: string): unknown {
  try {
    // Derive the same key using the stored salt
    const key = CryptoJS.PBKDF2(password, encryptedData.salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key.toString());
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Invalid password or corrupted data');
    }
    
    return JSON.parse(decryptedString);
  } catch {
    throw new Error('Failed to decrypt form data. Please check your password.');
  }
}

/**
 * Hashes a password for storage (server-side verification)
 * @param password - The password to hash
 * @returns SHA-256 hash of the password
 */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

/**
 * Verifies a password against a hash
 * @param password - The password to verify
 * @param hash - The stored hash to compare against
 * @returns True if password matches hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
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
    message: isValid ? '' : 'Password cannot be empty'
  };
}

const cryptoUtils = {
  encryptFormData,
  decryptFormData,
  hashPassword,
  verifyPassword,
  validatePassword
};

export default cryptoUtils;
