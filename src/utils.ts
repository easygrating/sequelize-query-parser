/**
 * Utility function to replace tokens from a string with
 * given params.
 *
 * String tokens must have the following format
 * 'Lorem {1} dolor sit {2}, consectetur {3} elit'
 * where 1, 2 and 3 are indices to search in params
 * @param target string to parse
 * @param params params to replace in target string
 * @returns the result of replace tokens with params
 */
export function parseStringWithParams(
  target: string,
  ...params: string[]
): string {
  let value = target;
  for (let i = 0; i < params.length; i++) {
    value = value.replace(`{${i + 1}}`, params[i]);
  }
  return value;
}

/**
 * Checks if value is a string null
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isNullValue(value: string): boolean {
  const lowerValue = value.trim().toLowerCase();
  return lowerValue === "null" || lowerValue === "undefined";
}

/**
 * Checks if value is a string true or false
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isBooleanValue(value: string): boolean {
  return (
    typeof value === "string" &&
    (value.trim().toLowerCase() === "false" ||
      value.trim().toLowerCase() === "true")
  );
}

/**
 * Converts a string to a boolean value.
 *
 * @param {string} value - The string to be converted.
 * @return {boolean|null} - The converted boolean value if the string is recognized as representing a boolean, otherwise null.
 */
export function stringToBoolean(value: string) {
  let result: boolean | null = null;
  const sanitized = value.toLowerCase().trim();
  const thrutyValues = ["true", "t", "1"];
  const falsyValues = ["false", "f", "0"];
  if (thrutyValues.includes(sanitized)) result = true;
  else if (falsyValues.includes(sanitized)) result = false;
  else return result;
}
