import { NextFunction, Response } from "express";
import {
  INVALID_SEARCH_ATTRIBUTES_ERROR,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  WHERE_CLAUSE_NOT_FOUND_ERROR,
} from "../core/constants";
import { Model, Op, Sequelize } from "sequelize";
import { WherePrimitives, WhereType } from "../core/types";
import { findInclude, getAttributesByTypes } from "../utils";
import { intersection } from "lodash";
import { SequelizeQueryParserRequestInterface, IncludeObject } from "../core/interfaces";

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
 * Note 2: This middleware relies on the preceding use of the `buildInclude()` middleware located at `./build-include.ts`
 * to access the correct value from `req.sequelizeQueryParser.include`.
 *
 * @throws {Error} Throws an error if `req.sequelizeQueryParser` or `req.sequelizeQueryParser.model` is not present.
 * @throws {Error} Throws an error if an attribute specified in `req.query.searchAttributes` does not exist in the model or is not of type string or text.
 *
 * @returns Express middleware function
 */
export function buildSearch(
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

  // Extracting sequelize-query-parser parameters
  const where = req.sequelizeQueryParser.where;
  const include = req.sequelizeQueryParser.include || [];

  // Extracting query parameters
  const search = req.query.search as string;
  let searchAttributes =
    (req.query.searchAttributes as string)?.split(",") || [];

  // If no search term provided, proceed to the next middleware
  if (!search) return next();

  if (invalidSearchAttributes(model, searchAttributes)) {
    throw new Error(INVALID_SEARCH_ATTRIBUTES_ERROR);
  }

  // If no specified search attributes or empty, use all string or text attributes
  if (!searchAttributes || searchAttributes.length === 0) {
    searchAttributes = getAttributesByTypes(model, ["STRING", "TEXT"]);
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

  // Add nested associations to the 'where' search condition
  nestedSearch(searchCondition, searchAttributes, model, where, include);

  req.sequelizeQueryParser.where = where;

  // Move to the next middleware
  next();
}

/**
 * This function performs a nested search on a model's associations.
 *
 * @param {WherePrimitives} searchCondition - The condition to be used in the search query.
 * @param {string[]} searchAttributes - The attributes to be searched.
 * @param {typeof Model} model - The model on which the search is to be performed.
 * @param {WhereType} where - The WHERE clause for the search query.
 * @param {IncludeObject[]} include - The associated models to be included in the search.
 * @param {string[]} [depth=[]] - The depth of the search in the model's associations.
 */
function nestedSearch(
  searchCondition: WherePrimitives,
  searchAttributes: string[],
  model: typeof Model,
  where: WhereType,
  include: IncludeObject[],
  depth: string[] = []
) {
  // Add model association nested attributes to search
  // Get model associations
  const associations = Object.keys(model.associations);

  // Iterate associations
  associations.forEach((association) => {
    // Get the associated include
    const associatedInclude = findInclude(include, association);

    if (
      associatedInclude &&
      model.associations[association].isSingleAssociation
    ) {
      // Get the associated model
      const associatedModel = model.associations[association].target;

      // Get attributes of the associated model that are of type string or text
      let stringAttributes = getAttributesByTypes(associatedModel, [
        "STRING",
        "TEXT",
      ]);
      stringAttributes = intersection(stringAttributes, searchAttributes);

      // Construct the search query for each specified attribute with case-insensitive search
      stringAttributes.forEach((item) => {
        const newItem = {
          [`${
            depth.length > 0 ? depth.join(".") + "." : ""
          }${association}.${item}`]: searchCondition,
        };
        (where[Op.or] as Array<WherePrimitives>).push(newItem);
      });
      if (depth.length > 1) depth.pop();

      // Recursively search the include object
      if (associatedInclude.include && associatedInclude.include.length > 0) {
        depth.push(association);
        nestedSearch(
          searchCondition,
          searchAttributes,
          associatedModel,
          where,
          associatedInclude.include,
          depth
        );
      }
    }
  });
}

/**
 * Checks for invalid search attributes in a Sequelize model based on provided search attributes.
 * @param model - Sequelize Model class to inspect
 * @param searchAttributes - Array of attributes to search within the model
 * @returns {boolean} Indicates if any provided search attributes are invalid for string or text data types
 */
function invalidSearchAttributes(
  model: typeof Model,
  searchAttributes: string[]
): boolean {
  const stringOrTextAttributes = getAttributesByTypes(model, [
    "STRING",
    "TEXT",
  ]);

  // Check for invalid search attributes
  const invalidSearchAttributes = searchAttributes?.some(
    (item) => !stringOrTextAttributes.includes(item)
  );

  return invalidSearchAttributes;
}
