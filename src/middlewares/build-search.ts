import { NextFunction, Response } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import {
  INVALID_SEARCH_ATTRIBUTES_ERROR,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  WHERE_CLAUSE_NOT_FOUND_ERROR,
} from "../core/constants";
import { Op, Sequelize } from "sequelize";
import {
  WherePrimitives,
} from "../core/types";

/**
 * Middleware function to build a search query based on provided parameters.
 * verifies if there is a req.query.search and a req.query.searchAttributes
 * object and transforms its data in a valid Sequelize 'where' clause;
 * which checks, via 'ilike' sql function, the value of 'search'
 * against the given model's search attributes. Then, it assigns
 * the created Sequelize 'where' clause to the req.sequelizeQueryParser.where object.
 *
 * Note 1: This middleware relies on the preceding use of the `buildWhere()` middleware located at `./build-where.ts`
 * to access the correct value from `req.sequelizeQueryParser.where`.
 *
 * Note 2: This middleware relies on the preceding use of the `buildIncludes()` middleware located at `./build-includes.ts`
 * to access the correct value from `req.sequelizeQueryParser.includes`.
 *
 * @throws {Error} Throws an error if `req.sequelizeQueryParser` or `req.sequelizeQueryParser.model` is not present.
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
    if (!req.sequelizeQueryParser)
      throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
    if (!req.sequelizeQueryParser.model)
      throw new Error(MODEL_NOT_CONFIGURED_ERROR);
    if (!req.sequelizeQueryParser.where)
      throw new Error(WHERE_CLAUSE_NOT_FOUND_ERROR);

    // Get model and attributes
    const model = req.sequelizeQueryParser.model;
    const attributes = model.rawAttributes;

    // Extracting sequelize-query-parser parameters
    const where = req.sequelizeQueryParser.where;
    const includes =
      (req.sequelizeQueryParser.includes as string)?.split(",") || []; // TODO: update when includes middleware is defined

    // Extracting query parameters
    const search = req.query.search as string;
    let searchAttributes =
      (req.query.searchAttributes as string)?.split(",") || [];

    // If no search term provided, proceed to the next middleware
    if (!search) return next();

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

    // Prepare the 'where' condition for the search
    if (!where[Op.or]) where[Op.or] = [];

    // Get database dialect for model
    const dialect = (model.sequelize as Sequelize).getDialect();

    // Construct the search query for each specified attribute with case-insensitive search
    let searchCondition: WherePrimitives;
    // Switch dialect (no ternary, anticipating future changes to operator support)
    switch (dialect) {
      case "postgres":
        searchCondition = { [Op.iLike]: `%${search}%` };
        break;
      default:
        searchCondition = { [Op.like]: `%${search}%` };
        break;
    }
    searchAttributes.forEach((item) => {
      const newItem: WherePrimitives = { [item]: searchCondition };
      (where[Op.or] as Array<WherePrimitives>).push(newItem);
    });

    // Add model association nested attributes to search
    // Get model associations
    const associations = Object.keys(model.associations);

    // For each association, check if it's in the searchAttributes
    associations.forEach((association) => {
      if (includes.includes(association)) {
        // Get the associated model
        const associatedModel = model.associations[association].target;
        const associatedAttributes = associatedModel.rawAttributes;

        // Get attributes of the associated model that are of type string or text
        const associatedStringOrTextAttributes = Object.keys(
          associatedAttributes
        ).filter((attribute) => {
          const dataType =
            associatedAttributes[attribute].type.constructor.name;
          return ["STRING", "TEXT"].includes(dataType);
        });

        // Construct the search query for each specified attribute with case-insensitive search
        associatedStringOrTextAttributes.forEach((item) => {
          const newItem = { [`${association}.${item}`]: searchCondition };
          (where[Op.or] as Array<WherePrimitives>).push(newItem);
        });
      }
    });

    req.sequelizeQueryParser.where = where;

    // Move to the next middleware
    next();
  };
}
