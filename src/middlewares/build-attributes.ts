import { Response, NextFunction } from "express";
import { MODEL_NOT_CONFIGURED_ERROR, SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR } from "../core/constants";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";

/**
 * Middleware to parse an HTTP query and build an attributes configuration object to use in a selection query
 * with sequelize.
 *
 * Selection can be performed in the following format
 * `
 * /?attributes=name:asc,code:asc,not:id,Municipality.code
 * `
 * a comma separated values of type propertyName:sortDirection or associationPath.propertyName:sortDirection
 *
 * @param {SequelizeQueryParserRequestInterface} req express request object with an additional sequelizeQueryParser property
 * @param {Response} res express response object
 * @param {NextFunction} next function to call the next middleware
 * @throws {Error} throws an error if a model was not found in sequelizeQueryParser property
 */
export function buildAttributes(
  req: SequelizeQueryParserRequestInterface,
  res: Response,
  next: NextFunction
) {
  if (!req.sequelizeQueryParser) throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
  if (!req.sequelizeQueryParser.model) throw new Error(MODEL_NOT_CONFIGURED_ERROR);

  if (!req.query.attributes) return next();

  let rawAttributes: string[] = [];
  if ("string" === typeof req.query.attributes) {
    rawAttributes = req.query.attributes.split(",");
  } else if (Array.isArray(req.query.attributes)) {
    rawAttributes = req.query.attributes as string[];
  } else {
    return next();
  }

  const include: string[] = [];
  const exclude: string[] = [];
  const associations: any[] = [];
  rawAttributes.forEach((item) => {
    const attribute = item.split(".");
    if (attribute.length === 1) {
      if (attribute[0].includes("not:")) {
        exclude.push(attribute[0].replace("not:", ""));
      } else {
        include.push(attribute[0]);
      }
    } else {
      associations.push({
        associationPath: [
          attribute[0].replace("not:", ""),
          ...attribute.slice(1, attribute.length - 2),
        ],
        exclude: attribute[0].includes("not:"),
        attribute: attribute[attribute.length - 1],
      });
    }
  });

  req.sequelizeQueryParser = {
    ...req.sequelizeQueryParser,
    attributes: {
      include,
      exclude,
      associations,
    },
  };
  next();
}
