import { Request } from "express";
import { SequelizeQueryParserDataInterface } from "./sequelize-query-parser-data.interface";

/**
 * Extends the Express Request object to store Sequelize library-specific data.
 */
export interface SequelizeQueryParserRequestInterface extends Request {
  /**
   * SequelizeQueryParser object to contain Sequelize-related properties.
   */
  sequelizeQueryParser?: SequelizeQueryParserDataInterface;
}
