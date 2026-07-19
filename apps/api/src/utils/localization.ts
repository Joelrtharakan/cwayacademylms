export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'hi', 'ta', 'te', 'ml', 'kn'];

/**
 * Type guard to check if a value is a translation object
 * A translation object has at least one of the supported locale keys
 */
export function isTranslationObject(val: any): boolean {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
  // If it has at least 'en' or any other supported locale, we consider it a translation object
  return SUPPORTED_LOCALES.some(locale => locale in val);
}

/**
 * Resolves a translation object to a plain string for the requested locale.
 * Fallbacks to English, then to whatever first key is available.
 */
export function resolveTranslation(obj: any, locale: string = DEFAULT_LOCALE): string {
  if (!isTranslationObject(obj)) {
    return typeof obj === 'string' ? obj : JSON.stringify(obj);
  }

  if (obj[locale]) return obj[locale] as string;
  if (obj[DEFAULT_LOCALE]) return obj[DEFAULT_LOCALE] as string;
  
  // Fallback to first available language if en is also missing
  const firstKey = Object.keys(obj)[0];
  return firstKey ? (obj[firstKey] as string) : "";
}

/**
 * Deeply traverses an object or array and resolves any translation objects it finds.
 */
export function deepResolveTranslations(data: any, locale: string = DEFAULT_LOCALE): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => deepResolveTranslations(item, locale));
  }

  if (typeof data === 'object') {
    // If this specific object is a translation object, resolve it entirely to a string
    if (isTranslationObject(data)) {
      return resolveTranslation(data, locale);
    }

    // Otherwise, iterate its properties
    const resolvedObj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Exclude specific fields from deep resolution if necessary, e.g. dates or Buffers
        if (data[key] instanceof Date) {
          resolvedObj[key] = data[key];
        } else {
          resolvedObj[key] = deepResolveTranslations(data[key], locale);
        }
      }
    }
    return resolvedObj;
  }

  return data;
}
