export function buildCacheKey(givenKey: string, keyPrefix?: string): string {
  return keyPrefix ? `${keyPrefix}:${givenKey}` : givenKey;
}
