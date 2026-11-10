const CAMEL_CASE_BOUNDARY = /([a-z0-9])([A-Z])/g;

/**
 * Разбивает «слитные» имена для показа: `DemonClaw` → `Demon Claw`.
 * Исходное значение при этом не меняется, поэтому старые профили
 * и ключи переводов продолжают работать.
 */
export function splitCamelCase(value: string): string {
  return value.replace(CAMEL_CASE_BOUNDARY, '$1 $2');
}
