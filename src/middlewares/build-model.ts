import { Response, NextFunction } from "express";
import { pluralize, underscore } from "inflection";
import { Model } from "sequelize";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces";
import { MODEL_NOT_FOUND_ERROR } from "../core/constants";

/**
 * Middleware to load a Sequelize model that will be used in crud operations for a given route.
 * HTTP methods for a given resource must be groupped under the same route param.
 * Ex: GET /users, POST /users, PUT /users/:id, DELETE /users/:id are groupped under `users` param
 * and will match with User (or user) model
 *
 * If no model name is provided. The model that it's pruralized name match with the current route param
 * will be loaded into sequelizeQueryParser request property
 * @param db
 * @param modelName Optional. Model name to match with
 * @returns express middleware that will load a sequelize model for a given nodelName or a route model parameter
 */
export function buildModel(
  db: { [key: string]: typeof Model },
  modelName?: string
) {
  return function (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) {
    const modelUrl = req.params.model;
    let model = Object.values(db).find((item) => {
      return (
        item.prototype instanceof Model &&
        (item.name === modelName ||
          underscore(pluralize(item.name)) === modelUrl)
      );
    });

    if (!model) {
      throw new Error(MODEL_NOT_FOUND_ERROR);
    }
    req.sequelizeQueryParser = {
      ...req.sequelizeQueryParser,
      model,
      order: null,
    };

    next();
  };
}
