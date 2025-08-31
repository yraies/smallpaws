import {
  encryptFormData,
  decryptFormData,
  hashPassword,
  verifyPassword,
  validatePassword,
  EncryptedData
} from '../crypto';

describe('Crypto Functions', () => {
  // Sample form data for testing
  const sampleForm = {
    name: 'Test Form',
    id: 'test-form-1',
    categories: [
      {
        name: 'Test Category',
        questions: [
          {
            question: 'Sample question?',
            selection: 'must'
          }
        ]
      }
    ]
  };

  const testPassword = 'test123';
  const differentPassword = 'different456';

  describe('Password Validation', () => {
    test('validates any non-empty password', () => {
      const result = validatePassword('a');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    test('rejects empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password cannot be empty');
    });

    test('validates simple passwords', () => {
      const result = validatePassword('simple');
      expect(result.isValid).toBe(true);
      expect(result.requirements.minLength).toBe(true);
      expect(result.requirements.hasUppercase).toBe(true);
      expect(result.requirements.hasLowercase).toBe(true);
      expect(result.requirements.hasNumber).toBe(true);
    });

    test('validates complex passwords', () => {
      const result = validatePassword('Complex123!@#');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Password Hashing', () => {
    test('hashes password consistently', () => {
      const hash1 = hashPassword(testPassword);
      const hash2 = hashPassword(testPassword);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64-character hex string
    });

    test('produces different hashes for different passwords', () => {
      const hash1 = hashPassword(testPassword);
      const hash2 = hashPassword(differentPassword);
      expect(hash1).not.toBe(hash2);
    });

    test('verifies correct password', () => {
      const hash = hashPassword(testPassword);
      expect(verifyPassword(testPassword, hash)).toBe(true);
    });

    test('rejects incorrect password', () => {
      const hash = hashPassword(testPassword);
      expect(verifyPassword(differentPassword, hash)).toBe(false);
    });
  });

  describe('Form Encryption/Decryption Cycle', () => {
    test('encrypts and decrypts simple string data', () => {
      const testData = 'Hello, World!';
      
      const encrypted = encryptFormData(testData, testPassword);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      expect(typeof encrypted.encrypted).toBe('string');
      expect(typeof encrypted.salt).toBe('string');
      expect(encrypted.encrypted).not.toBe(testData);
      
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toBe(testData);
    });

    test('encrypts and decrypts complex object data', () => {
      const encrypted = encryptFormData(sampleForm, testPassword);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toEqual(sampleForm);
    });

    test('encrypts and decrypts form-like objects', () => {
      // Create a form-like object structure
      const formData = {
        name: 'Test Form',
        categories: [
          {
            name: 'Test Category',
            questions: [
              {
                question: 'Test question?',
                selection: 'must'
              }
            ]
          }
        ]
      };
      
      const encrypted = encryptFormData(formData, testPassword);
      const decrypted = decryptFormData(encrypted, testPassword) as typeof formData;
      
      // Should decrypt to the same structure
      expect(decrypted).toHaveProperty('name', 'Test Form');
      expect(decrypted).toHaveProperty('categories');
      expect(Array.isArray(decrypted.categories)).toBe(true);
      expect(decrypted.categories[0]).toHaveProperty('name', 'Test Category');
      expect(decrypted.categories[0].questions[0]).toHaveProperty('selection', 'must');
    });

    test('generates different encrypted data for same input', () => {
      const encrypted1 = encryptFormData(sampleForm, testPassword);
      const encrypted2 = encryptFormData(sampleForm, testPassword);
      
      // Should have different encrypted strings due to random salt
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      
      // But both should decrypt to the same data
      const decrypted1 = decryptFormData(encrypted1, testPassword);
      const decrypted2 = decryptFormData(encrypted2, testPassword);
      expect(decrypted1).toEqual(decrypted2);
      expect(decrypted1).toEqual(sampleForm);
    });

    test('fails decryption with wrong password', () => {
      const encrypted = encryptFormData(sampleForm, testPassword);
      
      expect(() => {
        decryptFormData(encrypted, differentPassword);
      }).toThrow('Failed to decrypt form data. Please check your password.');
    });

    test('fails decryption with corrupted encrypted data', () => {
      const encrypted = encryptFormData(sampleForm, testPassword);
      const corrupted: EncryptedData = {
        encrypted: 'corrupted_data',
        salt: encrypted.salt
      };
      
      expect(() => {
        decryptFormData(corrupted, testPassword);
      }).toThrow('Failed to decrypt form data. Please check your password.');
    });

    test('fails decryption with corrupted salt', () => {
      const encrypted = encryptFormData(sampleForm, testPassword);
      const corruptedSalt: EncryptedData = {
        encrypted: encrypted.encrypted,
        salt: 'corrupted_salt'
      };
      
      expect(() => {
        decryptFormData(corruptedSalt, testPassword);
      }).toThrow('Failed to decrypt form data. Please check your password.');
    });

    test('handles empty data encryption/decryption', () => {
      const emptyData = {};
      const encrypted = encryptFormData(emptyData, testPassword);
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toEqual(emptyData);
    });

    test('handles null and undefined values', () => {
      const nullData = null;
      const encrypted = encryptFormData(nullData, testPassword);
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toBeNull();
      
      // Note: JSON.stringify(undefined) returns undefined, not a string
      // So we test with a container object that has an undefined property
      const objectWithUndefined = { value: undefined };
      const encrypted2 = encryptFormData(objectWithUndefined, testPassword);
      const decrypted2 = decryptFormData(encrypted2, testPassword) as Record<string, unknown>;
      expect(decrypted2).toEqual({}); // JSON.stringify removes undefined properties
    });

    test('handles arrays in form data', () => {
      const arrayData = [1, 2, 3, 'test', { nested: true }];
      const encrypted = encryptFormData(arrayData, testPassword);
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toEqual(arrayData);
    });

    test('handles deeply nested objects', () => {
      const nestedData = {
        level1: {
          level2: {
            level3: {
              deep: 'value',
              array: [1, 2, { nested: 'object' }],
              boolean: true,
              number: 42
            }
          }
        }
      };
      
      const encrypted = encryptFormData(nestedData, testPassword);
      const decrypted = decryptFormData(encrypted, testPassword);
      expect(decrypted).toEqual(nestedData);
    });

    test('encryption produces consistent structure', () => {
      const encrypted = encryptFormData(sampleForm, testPassword);
      
      expect(typeof encrypted).toBe('object');
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      expect(Object.keys(encrypted)).toHaveLength(2);
      expect(encrypted.salt).toMatch(/^[a-f0-9]+$/); // Should be hex string
      expect(encrypted.encrypted).toBeTruthy();
    });

    test('different passwords produce different hashes but same decryption capability', () => {
      const password1 = 'password1';
      const password2 = 'password2';
      
      const hash1 = hashPassword(password1);
      const hash2 = hashPassword(password2);
      expect(hash1).not.toBe(hash2);
      
      const encrypted1 = encryptFormData(sampleForm, password1);
      const encrypted2 = encryptFormData(sampleForm, password2);
      
      // Each can decrypt its own data
      const decrypted1 = decryptFormData(encrypted1, password1);
      const decrypted2 = decryptFormData(encrypted2, password2);
      expect(decrypted1).toEqual(sampleForm);
      expect(decrypted2).toEqual(sampleForm);
      
      // But cannot decrypt each other's data
      expect(() => decryptFormData(encrypted1, password2)).toThrow();
      expect(() => decryptFormData(encrypted2, password1)).toThrow();
    });

    test('salt randomness ensures different encryptions', () => {
      const encryptions = [];
      for (let i = 0; i < 10; i++) {
        encryptions.push(encryptFormData(sampleForm, testPassword));
      }
      
      // All salts should be different
      const salts = encryptions.map(e => e.salt);
      const uniqueSalts = new Set(salts);
      expect(uniqueSalts.size).toBe(10);
      
      // All encrypted data should be different
      const encryptedData = encryptions.map(e => e.encrypted);
      const uniqueEncrypted = new Set(encryptedData);
      expect(uniqueEncrypted.size).toBe(10);
      
      // But all should decrypt to the same data
      encryptions.forEach(encrypted => {
        const decrypted = decryptFormData(encrypted, testPassword);
        expect(decrypted).toEqual(sampleForm);
      });
    });
  });

  describe('End-to-End Form Storage Simulation', () => {
    test('simulates complete form save/load cycle', () => {
      const originalForm = {
        name: 'Product Planning Form',
        categories: [
          {
            name: 'Features',
            questions: [
              {
                question: 'How important is this feature?',
                selection: 'like'
              }
            ]
          }
        ]
      };
      
      const password = 'mySecretPassword';
      
      // Step 1: Encrypt the form (as would happen in FormPage)
      const encryptedData = encryptFormData(originalForm, password);
      const passwordHash = hashPassword(password);
      
      // Step 2: Simulate API storage (JSON.stringify as done in API)
      const storedData = JSON.stringify(encryptedData);
      
      // Step 3: Simulate API retrieval and verification
      const retrievedData = JSON.parse(storedData) as EncryptedData;
      const isPasswordValid = verifyPassword(password, passwordHash);
      expect(isPasswordValid).toBe(true);
      
      // Step 4: Decrypt the form (as would happen in FormPage)
      const decryptedFormData = decryptFormData(retrievedData, password) as typeof originalForm;
      
      // Step 5: Verify the decrypted data matches original
      expect(decryptedFormData).toHaveProperty('name', 'Product Planning Form');
      expect(decryptedFormData).toHaveProperty('categories');
      
      // Verify deep structure
      const categories = decryptedFormData.categories;
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toHaveLength(1);
      expect(categories[0]).toHaveProperty('name', 'Features');
      expect(categories[0]).toHaveProperty('questions');
      expect(categories[0].questions).toHaveLength(1);
      expect(categories[0].questions[0]).toHaveProperty('question', 'How important is this feature?');
      expect(categories[0].questions[0]).toHaveProperty('selection', 'like');
    });

    test('simulates wrong password scenario', () => {
      const formData = { name: 'Secret Form', data: 'secret information' };
      const correctPassword = 'correct123';
      const wrongPassword = 'wrong456';
      
      // Encrypt with correct password
      const encrypted = encryptFormData(formData, correctPassword);
      const passwordHash = hashPassword(correctPassword);
      
      // Simulate storage and retrieval
      const stored = JSON.stringify(encrypted);
      const retrieved = JSON.parse(stored) as EncryptedData;
      
      // Wrong password should fail verification
      expect(verifyPassword(wrongPassword, passwordHash)).toBe(false);
      
      // Wrong password should fail decryption
      expect(() => {
        decryptFormData(retrieved, wrongPassword);
      }).toThrow('Failed to decrypt form data. Please check your password.');
    });

    test('simulates data corruption scenario', () => {
      const formData = { name: 'Important Form', data: 'important data' };
      const password = 'password123';
      
      // Encrypt normally
      const encrypted = encryptFormData(formData, password);
      
      // Simulate data corruption during storage/transmission
      const corruptedData = JSON.stringify({
        encrypted: encrypted.encrypted.substring(0, -5) + 'XXXXX', // Corrupt end of encrypted data
        salt: encrypted.salt
      });
      
      const retrievedCorruptedData = JSON.parse(corruptedData) as EncryptedData;
      
      // Should fail to decrypt corrupted data
      expect(() => {
        decryptFormData(retrievedCorruptedData, password);
      }).toThrow('Failed to decrypt form data. Please check your password.');
    });
  });
});
