import { isValidArtifactId } from "../idValidation";

describe("artifact id validation", () => {
  test("accepts current typeid-shaped artifact ids", () => {
    expect(isValidArtifactId("form_01kqa3jnpjecvb10r6ttvqhvca", "form")).toBe(
      true,
    );
    expect(
      isValidArtifactId("template_01kqa37jfbecvb10qwbrr4zsbw", "template"),
    ).toBe(true);
    expect(isValidArtifactId("share_01kqa3mnbrfajrcjrrmfh86vs4", "share")).toBe(
      true,
    );
  });

  test("accepts existing local draft style ids with safe characters", () => {
    expect(isValidArtifactId("form_1712345678901_abcd1234", "form")).toBe(true);
  });

  test("rejects malformed or wrong-prefix ids", () => {
    expect(isValidArtifactId("", "form")).toBe(false);
    expect(isValidArtifactId("nope", "form")).toBe(false);
    expect(isValidArtifactId("template_abc123", "form")).toBe(false);
    expect(isValidArtifactId("form_../../etc/passwd", "form")).toBe(false);
  });
});
