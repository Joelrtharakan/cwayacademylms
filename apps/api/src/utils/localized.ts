/**
 * Resolves a localized-text value (stored as Prisma `Json`, e.g.
 * `{ "en": "...", "hi": "..." }`) to a plain string. Prefers the requested
 * locale, then English, then the first non-empty value. Tolerates plain
 * strings and JSON-encoded strings too, so it is safe to call on any title.
 */
export function resolveLocalized(value: unknown, locale = "en"): string {
  if (value == null) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{")) {
      try {
        return resolveLocalized(JSON.parse(trimmed), locale);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const pick =
      obj[locale] ??
      obj["en"] ??
      Object.values(obj).find((v) => typeof v === "string" && v.trim().length > 0);
    return typeof pick === "string" ? pick : "";
  }

  return String(value);
}
