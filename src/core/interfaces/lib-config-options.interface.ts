import { Model } from "sequelize";

/**
 * Global settings options
 *
 * Used to pass values to QueryParserConfig singleton class
 */
export interface LibConfigOptionsInterface {
  models: (typeof Model)[];
  customMiddlewaresPath: string;
}
