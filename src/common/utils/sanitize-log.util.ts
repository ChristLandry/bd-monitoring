const SENSITIVE_KEY_PATTERN =
  /password|token|secret|authorization|api[_-]?key|refresh/i;

export function sanitizeForLog(
  value: unknown,
  depth = 0,
  maxDepth = 6,
): unknown {
  if (depth > maxDepth) {
    return '[profondeur max]';
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item, depth + 1, maxDepth));
  }
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      result[key] = '***';
    } else {
      result[key] = sanitizeForLog(val, depth + 1, maxDepth);
    }
  }
  return result;
}

export function truncateForLog(
  value: string,
  maxLength: number,
): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}… [tronqué, ${value.length} car.]`;
}

export function stringifyForLog(
  value: unknown,
  maxLength: number,
): string {
  try {
    const raw = JSON.stringify(value);
    return truncateForLog(raw, maxLength);
  } catch {
    return '[non sérialisable]';
  }
}
