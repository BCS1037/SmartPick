export type JsonRecord = Record<string, unknown>;

export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireJsonRecord(value: unknown, context: string): JsonRecord {
  if (!isJsonRecord(value)) {
    throw new Error(`${context} returned an invalid JSON object`);
  }

  return value;
}

export function getJsonArray(record: JsonRecord, key: string): unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

export function getJsonRecord(record: JsonRecord, key: string): JsonRecord | undefined {
  const value = record[key];
  return isJsonRecord(value) ? value : undefined;
}

export function getJsonString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

export function parseJsonRecord(value: string): JsonRecord | undefined {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isJsonRecord(parsed) ? parsed : undefined;
  } catch {
    // 无效的 SSE 或 NDJSON 行不应中断已收到的有效响应。
    return undefined;
  }
}
