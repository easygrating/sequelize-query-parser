import { Model } from "sequelize";
import { AttributesConfig } from "./attributes-config.interface";
import { OrderType, WhereType } from "../types";
import { QueryType } from "../types/query-type";

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
  order?: OrderType[];

  /**
   * Query parser attribute configuration
   */
  attributes?: AttributesConfig;

  /**
   * Configuration for the where query to the database.
   */
  where?: WhereType;

  /**
   * Configuration for the query object to pass to the Sequelize find function.
   */
  query?: QueryType;

  /**
   * Advanced where opperation
   */
  filter?: any;

  /**
   * Additional properties for utility purposes.
   * @deprecated Future releases will replace this with more specific utility properties.
   */
  [key: string]: any;
}
