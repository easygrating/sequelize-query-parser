/**
 * `WhereType` is used to define the structure of a WHERE clause in a Sequelize query.
 * */
export type WhereType = {
  /**
   * Any set of properties with values to query the model
   */
  [key: string | symbol]: WherePrimitives | WhereArrays | WhereType;
};

/**
 * Primitive values definitions
 */
export type WherePrimitives =
  | string
  | number
  | Date
  | boolean
  | null
  | { [key: string | symbol]: WherePrimitives };

/**
 * Array types definition
 */
export type WhereArrays =
  | string[]
  | number[]
  | Date[]
  | boolean[]
  | []
  | WhereType[];
