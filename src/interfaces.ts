import { Request } from "express";
import { Model } from "sequelize";

/**
 * An Express request extension to store library data
 *
 */
export interface SequelizeQueryParserRequestInterface extends Request {
  sequelizeQueryParser?: {
    /**
     * Sequelize model property to use in a route group
     */
    model: typeof Model;

    /**
     * Easy to use additional properties
     *
     * @deprecated In futures releases this param will be replaced with
     * library specific utility properties
     */
    [k: string]: any;
  };
}
