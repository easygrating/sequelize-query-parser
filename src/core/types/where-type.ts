export type WhereType = {
  /**
   * Any set of properties with values to query the model
   */
  [key: string]: WherePrimitives | WhereArrays | WhereType;
};

/**
 * Primitive values definitions
 */
export type WherePrimitives = string | number | Date | boolean | null;
/**
 * Array types definition
 */
export type WhereArrays = string[] | number[] | Date[] | boolean[];
