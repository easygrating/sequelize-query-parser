import { Request } from "express";
import { Model } from "sequelize";
import { SortOrder } from "./enums";

/**
 * Extends the Express Request object to store Sequelize library-specific data.
 */
export interface SequelizeQueryParserRequestInterface extends Request {
  /**
   * SequelizeQueryParser object to contain Sequelize-related properties.
   */
  sequelizeQueryParser?: SequelizeQueryParserDataInterface;
}

/**
 * Data structure to contain Sequelize-related properties within the Express Request object.
 */
export interface SequelizeQueryParserDataInterface {
  /**
   * The Sequelize model property to be used in a route group.
   */
  model: typeof Model;

  /**
   * The Sequelize order property to be used in a generic query of a list route.
   */
  order: OrderType[] | null;

  /**
   * Additional properties for utility purposes.
   * @deprecated Future releases will replace this with more specific utility properties.
   */
  [key: string]: any;
}

/**
 * Sequelize order type
 */
export type OrderType = [any, SortOrder];
