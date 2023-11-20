import { Model } from "sequelize";
import { OrderType } from "../types";
import { AttributesConfig } from "./attributes-config.interface";

/**
 * Data structure to contain Sequelize-related properties within the Express Request object.
 */
export interface SequelizeQueryParserDataInterface {
  /**
   * The Sequelize model property to be used in a route group.
   */
  model?: typeof Model;

  /**
   * The Sequelize order property to be used in a generic query of a list route.
   */
  order?: OrderType[] | null;

  /**
   * Query parser attribute configuration
   */
  attributes?: AttributesConfig;

  /**
   * Additional properties for utility purposes.
   * @deprecated Future releases will replace this with more specific utility properties.
   */
  [key: string]: any;
}
