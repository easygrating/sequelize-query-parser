import { Response, NextFunction } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import * as nmodulesLoader from "@easygrating/nmodules-loader";
import { CustomModelMiddlewareInterface } from "../core/interfaces/custom-model-middleware.interface";

/**
 * Middleware to call a custom middleware for a given route.
 * If no middleware is found it will call next function.
 * Middlewares must be an object of type CustomModelMiddlewareInterface.
 * It will call the first middleware that has route param equals to req.params.model
 * or modelName is equal to the loaded model name in the request object.
 *
 * @param {string} path directory location for custom models
 * @returns custom express middleware for a given modelName or a route model parameter
 */
export function buildCustomModel(path?: string) {
  return async (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) => {
    const middlewares: CustomModelMiddlewareInterface[] =
      nmodulesLoader.loadModules(path);
    const custom = middlewares.find(
      (item) =>
        item.route === req.params.model ||
        item.modelName === req.sequelizeQueryParser?.model?.name
    );
    if (custom) return custom.customMiddleware(req, res, next);
    else next();
  };
}
