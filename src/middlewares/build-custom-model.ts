import { Response, NextFunction } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import * as nmodulesLoader from "@easygrating/nmodules-loader";
import { CustomModelMiddlewareInterface } from "../core/interfaces/custom-model-middleware.interface";
import path from "path";

/**
 * Middleware to call a custom middleware for a given route.
 * If no middleware is found it will call next function.
 * Middlewares must be an object of type CustomModelMiddlewareInterface.
 * It will call the first middleware that has route property equals to req.params.model
 * or modelName property is equal to the loaded model name in the request object.
 *
 * @param {string} pathDir directory location for custom models
 * @returns custom express middleware for a given modelName parameter or a route parameter
 */
export function buildCustomModel(pathDir?: string) {
  return async (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) => {
    if (!pathDir) {
      pathDir = path.resolve("./src/customMiddlewares");
    }
    const middlewares: CustomModelMiddlewareInterface[] =
      nmodulesLoader.loadModules(pathDir);
    const custom = middlewares.find(
      (item) =>
        item.route === req.params.model ||
        item.modelName === req.sequelizeQueryParser?.model?.name
    );
    if (custom) return custom.customMiddleware(req, res, next);
    else next();
  };
}
