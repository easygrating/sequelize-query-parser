import { Request } from "express";
import { Model } from "sequelize";

/**
 * An Express request extension to store library data
 *
 */
export interface RequestQueryParserInterface extends Request {
  queryParser?: {
    /**
     * Sequelize model property to use in a route group
     */
    model: typeof Model;

    /**
     * Contain the where query to use when quering the database
    */
    where?: any;

    /**
     * Easy to use additional properties
     *
     * @deprecated In futures releases this param will be replaced with
     * library specific utility properties
     */
    [k: string]: any;
  };
}
