const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

export function sanitize(input) {
  if (typeof input !== 'string') return input;
  return String(input).replace(/[&<>"'/]/g, (char) => ENTITY_MAP[char] || char);
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'string') {
      result[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string' ? sanitize(item) :
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function sanitizeTranslation(translation) {
  if (!translation) return translation;
  if (typeof translation === 'string') return sanitize(translation);
  return {
    en: sanitize(translation.en || ''),
    ta: sanitize(translation.ta || ''),
  };
}