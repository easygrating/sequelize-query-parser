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
