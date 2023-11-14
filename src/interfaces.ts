import { Request } from "express";

export interface SequelizeQueryParserRequestInterface extends Request {
  sequelizeQueryParser?: { [k: string]: any };
}
