import { Response, NextFunction } from "express";
import { SequelizeQueryParserRequestInterface } from "./sequelize-query-parser-request.interface";
/**
 * Custom middleware interface
 */
export interface CustomModelMiddlewareInterface {
  modelName: string;
  route: string;
  customMiddleware(
    req: SequelizeQueryParserRequestInterface,
    res: Response,
    next: NextFunction
  ): void;
}
