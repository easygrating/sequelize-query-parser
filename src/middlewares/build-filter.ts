import { NextFunction, Response } from "express";
import { Model, Op } from "sequelize";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import { parseStringWithParams } from "../utils";
import { INVALID_FILTER, MODEL_ATTRIBUTE_NOT_FOUND } from "../core/constants";
import { forEach, toPath, isNull, isUndefined, toNumber, set } from "lodash";

/**
 * Middleware that builds a sequelize where query from a filter query param
 * with a dot notation
 * Ex: users?age.lte.40 -> where:{ age: { [Op.lte]: 40 }}
 *
 * @throws {Error} Throws an error if an valid filter or model attribute is send in the query
 * @param req the custom request that extends from express.Request
 * @param res the Response from express
 * @param next the NextAction from express
 */
export function buildFilter(
  req: SequelizeQueryParserRequestInterface,
  res: Response,
  next: NextFunction
) {
  if (!req.query.filter) return next();

  let rawFilter: string[];
  if (Array.isArray(req.query.filter)) {
    rawFilter = req.query.filter as string[];
  } else {
    rawFilter = [req.query.filter as string];
  }
  const model = req.sequelizeQueryParser?.model;
  const filter = {};

  forEach(rawFilter, (v) => {
    const path = toPath(v);

    if (path.length < 2)
      throw new Error(parseStringWithParams(INVALID_FILTER, v));

    const value = path.pop();
    const pathWithOpperators = parsePath(path, model as typeof Model);
    set(filter, pathWithOpperators as string[], value);
  });

  req.sequelizeQueryParser = {
    ...req.sequelizeQueryParser,
    filter,
  };

  next();
}

/**
 * Converts an string path to an array object path with opperators and validate attributes.
 * @param paths string path
 * @param model model object
 * @returns parsed paths
 */
function parsePath(paths: string[], model: typeof Model) {
  const newPath: unknown[] = [];
  const attributes = Object.keys(model.rawAttributes);
  for (const item of paths) {
    if (Op[item]) {
      newPath.push(Op[item]);
      continue;
    }
    if (!(isNull(item) || isUndefined(item)) && isFinite(toNumber(item))) {
      newPath.push(item);
      continue;
    }
    if (!attributes.includes(item)) {
      throw new Error(
        parseStringWithParams(MODEL_ATTRIBUTE_NOT_FOUND, item, model.name)
      );
    }
    newPath.push(item);
  }

  return newPath;
}
