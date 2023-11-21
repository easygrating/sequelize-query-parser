import { NextFunction, Response } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import { isBooleanValue, isNullValue, parseStringWithParams } from "../utils";
import {
  INVALID_SEARCH_ATTRIBUTES_ERROR,
  INVALID_SEARCH_VALUE_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
} from "../core/constants";
import { Op, Sequelize } from "sequelize";

/**
 * Middleware function to build a search query based on provided parameters.
 * verifies if there is a req.query.search and a req.query.searchAttributes
 * object and transforms its data in a valid Sequelize 'where' clause;
 * which checks, via 'ilike' sql function, the value of 'search'
 * against the given model's search attributes. Then, it assigns
 * the created Sequelize 'where' clause to the req.sequelizeQueryParser.where object.
 *
 * Note: This middleware relies on the preceding use of the `buildWhere()` middleware located at `./build-where.ts`
 * to access the correct value from `req.sequelizeQueryParser.where`.
 *
 * @throws {Error} Throws an error if `req.sequelizeQueryParser` or `req.sequelizeQueryParser.model` is not present.
 * @throws {Error} Throws an error if `req.query.search` as the string value equivalent of null, undefined or a boolean value.
 * @throws {Error} Throws an error if an attribute specified in `req.query.searchAttributes` does not exist in the model or is not of type string or text.
 *
 * @returns Express middleware function
 */
export function buildSearch() {
  return function (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) {
    // Check if necessary Sequelize query parser data exists
    if (!req.sequelizeQueryParser || !req.sequelizeQueryParser.model) {
      throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
    }

    // Extracting query parameters
    let where = req.sequelizeQueryParser.where || {};
    const search = req.query.search as string;
    let searchAttributes =
      (req.query.searchAttributes as string)?.split(",") || null;

    // If no search term provided, proceed to the next middleware
    if (!search) {
      return next();
    }

    // Validate the search term
    if (!!isBooleanValue(search) || isNullValue(search)) {
      throw new Error(
        parseStringWithParams(INVALID_SEARCH_VALUE_ERROR, search)
      );
    }

    const model = req.sequelizeQueryParser.model;

    const attributes = model.rawAttributes;

    // Get attributes that are of type string or text
    const stringOrTextAttributes = Object.keys(attributes).filter(
      (attribute) => {
        const dataType = attributes[attribute].type.constructor.name;
        return ["STRING", "TEXT"].includes(dataType);
      }
    );

    // Check for invalid search attributes
    const invalidSearchAttributes = searchAttributes?.some(
      (item) => !stringOrTextAttributes.includes(item)
    );

    // Throw error for invalid search attributes
    if (invalidSearchAttributes) {
      throw new Error(INVALID_SEARCH_ATTRIBUTES_ERROR);
    }

    // If no specified search attributes or empty, use all string or text attributes
    if (!searchAttributes || searchAttributes.length === 0) {
      searchAttributes = stringOrTextAttributes;
    }

    // Prepare the where condition for the search
    if (!where[Op.or]) {
      where[Op.or] = [];
    }

    const dialect = (model.sequelize as Sequelize).getDialect();

    // Construct the search query for each specified attribute with case-insensitive search
    searchAttributes.forEach((item) => {
      const searchCondition =
        dialect === "postgres"
          ? { [Op.iLike]: `%${search}%` }
          : { [Op.like]: `%${search}%` };
      where[Op.or].push({ [item]: searchCondition });
    });

    // TODO: add model association nested attributes to search

    req.sequelizeQueryParser.where = where;

    // Move to the next middleware
    next();
  };
}
