import { Response, NextFunction } from "express";
import * as nmodulesLoader from "@easygrating/nmodules-loader";
import path from "path";
import { DEFAULT_CUSTOM_MIDDLEWARES_PATH } from "../core/constants";
import { SequelizeQueryParserRequestInterface, CustomModelMiddlewareInterface } from "../core/interfaces";
import { QueryParserConfig } from "../core/models";

/**
 * Middleware to call a custom middleware for a given route.
 * If no middleware is found it will call next function.
 * Middlewares must be an object of type CustomModelMiddlewareInterface.
 * It will call the first middleware that has route property equals to req.params.model
 * or modelName property is equal to the loaded model name in the request object.
 *
 * @param {string} path directory location for custom models
 * @returns custom express middleware for a given modelName parameter or a route parameter
 */
export function buildCustomModel() {
  return async (
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ) => {
    let pathDir = QueryParserConfig.getConfig().customMiddlewaresPath;
    if (!pathDir) {
      pathDir = path.resolve(DEFAULT_CUSTOM_MIDDLEWARES_PATH);
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
