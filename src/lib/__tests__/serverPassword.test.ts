import {
  verifyPasswordHashSecure,
  verifyPasswordLegacySecure,
} from "../serverPassword";

describe("server password verification", () => {
  test("verifies matching precomputed hashes", () => {
    expect(verifyPasswordHashSecure("abc123", "abc123")).toBe(true);
    expect(verifyPasswordHashSecure("abc123", "xyz789")).toBe(false);
  });

  test("verifies legacy plaintext passwords against stored hashes", () => {
    const storedHash =
      "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

    expect(verifyPasswordLegacySecure("password123", storedHash)).toBe(true);
    expect(verifyPasswordLegacySecure("wrong-password", storedHash)).toBe(
      false,
    );
  });
});
