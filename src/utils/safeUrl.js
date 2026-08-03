const cleanUrl = (value) =>
  Array.from(String(value || ""))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim();

export const toSafeExternalUrl = (value, fallback = "") => {
  const candidate = cleanUrl(value);
  if (!candidate) return fallback;

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" ? parsed.href : fallback;
  } catch {
    return fallback;
  }
};

export const toSafeNavigationUrl = (value, fallback = "/") => {
  const candidate = cleanUrl(value);

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }

  return toSafeExternalUrl(candidate, fallback);
};
