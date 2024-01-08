import { NextFunction, Response } from "express";
import { SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR } from "../core/constants";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces";
import { QueryType } from "../core/types";

/**
 * This function builds a query object based on the request parameters.
 * It is a middleware function for Express.js and is intended to be used in a route handler.
 *
 * @returns {Function} An Express.js middleware function
 */
export function buildQuery() {
  /**
   * The returned middleware function.
   *
   * @param {SequelizeQueryParserRequestInterface} req - The Express.js request object. It should have a `sequelizeQueryParser` property.
   * @param {Response} res - The Express.js response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   * @throws Will throw an error if `sequelizeQueryParser` property does not exist on the request object.
   */
  return function (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) {
    // Check if necessary Sequelize query parser data exists
    if (!req.sequelizeQueryParser)
      throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);

    const where = req.sequelizeQueryParser.where;
    const include = req.sequelizeQueryParser.associations || [];
    const attributes = req.sequelizeQueryParser.attributes;
    const order = req.sequelizeQueryParser.order;
    const limit = req.query.limit ? +req.query.limit : 10;
    let skip = req.query.skip ? +req.query.skip : 0;
    skip = req.query.page ? limit * (+req.query.page - 1) : 0;

    const query: QueryType = {
      offset: skip,
      limit: limit,
    };

    if (order) query.order = order;
    if (include) query.include = include;
    if (attributes) query.attributes = attributes;
    if (where) query.where = where;

    req.sequelizeQueryParser.query = query;
    next();
  };
}
