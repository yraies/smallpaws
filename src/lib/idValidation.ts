const ARTIFACT_ID_SUFFIX_PATTERN = /^[a-z0-9][a-z0-9_-]{5,127}$/;

export type ArtifactIdPrefix = "form" | "share" | "template";

export function isValidArtifactId(
  value: string,
  prefix: ArtifactIdPrefix,
): boolean {
  if (typeof value !== "string" || !value.startsWith(`${prefix}_`)) {
    return false;
  }

  const suffix = value.slice(prefix.length + 1);
  return ARTIFACT_ID_SUFFIX_PATTERN.test(suffix);
}
