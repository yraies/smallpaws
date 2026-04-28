import CryptoJS from "crypto-js";
import {
  decryptFormData,
  type EncryptedData,
  encryptFormData,
  LEGACY_PBKDF2_ITERATIONS,
  PBKDF2_ITERATIONS,
} from "../crypto";

describe("crypto smoke", () => {
  test("uses hardened PBKDF2 iterations for new encryptions", () => {
    expect(PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(600_000);
  });

  test("round-trips one encrypted payload", () => {
    const original = { name: "Smoke Test", categories: [] };
    const encrypted = encryptFormData(original, "smoke-pass-123");
    const decrypted = decryptFormData(encrypted, "smoke-pass-123");

    expect(decrypted).toEqual(original);
  });

  test("keeps legacy no-iv payloads readable", () => {
    const original = { name: "Legacy", categories: [] };
    const salt = CryptoJS.lib.WordArray.random(256 / 8).toString();
    const key = CryptoJS.PBKDF2("legacy-pass", salt, {
      keySize: 256 / 32,
      iterations: LEGACY_PBKDF2_ITERATIONS,
    });
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(original),
      key.toString(),
    ).toString();

    const legacyData: EncryptedData = { encrypted, salt };
    const decrypted = decryptFormData(legacyData, "legacy-pass");

    expect(decrypted).toEqual(original);
  });
});
