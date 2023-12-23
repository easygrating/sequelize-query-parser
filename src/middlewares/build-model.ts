import { Response, NextFunction } from "express";
import { pluralize, underscore } from "inflection";
import { MODEL_NOT_FOUND_ERROR } from "../core/constants";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import { QueryParserConfig } from "../core/models";

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
 * @throws {Error} Throws an error if a model is not found for given parameters.
 * @returns express middleware that will load a sequelize model for a given modelName or a route model parameter
 */
export function buildModel(modelName?: string) {
  return (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) => {
    const models = QueryParserConfig.getConfig().models;
    const modelUrl = req.params.model;
    const model = models.find((item) => {
      return (
        !!item.name &&
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
    };

    next();
  };
}
