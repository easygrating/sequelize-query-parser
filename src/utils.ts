import { Model } from "sequelize";
import { IncludeObject } from "./core/interfaces/include-object.interface";

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
export function stringToBoolean(value: string): boolean | null {
  const sanitized = value.toLowerCase().trim();
  const thrutyValues = ["true", "t", "1"];
  const falsyValues = ["false", "f", "0"];
  if (thrutyValues.includes(sanitized)) return true;
  else if (falsyValues.includes(sanitized)) return false;
  else return null;
}

/**
 * Finds an association within an array of IncludeObject recursively.
 * @param includes - Array of IncludeObject representing associations
 * @param association - Association name to search for within the IncludeObject array
 * @returns {IncludeObject | null} The found IncludeObject for the specified association, or null if not found
 */
export function findInclude(includes: IncludeObject[], association: string): IncludeObject | null {
  for (let i = 0; i < includes.length; i++) {
    const item = includes[i];
    if (item.association === association) {
      return item;
    }
    if (item.include) {
      const innerInclude = findInclude(item.include, association);
      if (innerInclude) return innerInclude;
    }
  }
  return null;
}

/**
 * Retrieves attribute names from a Sequelize model's raw attributes whose types
 * are included in the types array.
 * @param model - Sequelize Model class
 * @param {string[]} types - An array of Sequelize attribute types, ex.: ["STRING", "TEXT"].
 * @returns {string[]} Array of attribute names with string or text data type
 */
export function getAttributesByTypes(
  model: typeof Model,
  types: string[]
): string[] {
  const attributes = Object.keys(model.rawAttributes)
    .filter((attribute) => {
      const dataType = model.rawAttributes[attribute].type.constructor.name;
      return types.includes(dataType);
    });

  return attributes;
}
