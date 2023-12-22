import { NextFunction, Response } from "express";
import { DateTime } from "luxon";
import { isNullValue, stringToBoolean } from "../utils";
import { INVALID_NUMBER, dateTimePattern, INVALID_DATE } from "../core/constants";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces";

/**
 * Middleware that builds the query from the query params to be use in querying the model in the database
 * Ex: users?name=Maru&age=32 -> where:{ name: 'Maru', age: 32}
 *
 * @throws {Error} Throws an error if a valid number or date format is send in the request
 * @param req the custom request that extends from express.Request
 * @param res the Response from express
 * @param next the NextAction from express
 */
export function buildWhere(req: SequelizeQueryParserRequestInterface, res: Response, next: NextFunction) {
  const where: any = req.query?.where || {};
  if (req.sequelizeQueryParser && req.sequelizeQueryParser.model) {
    const entityFields: any = req.sequelizeQueryParser.model.rawAttributes;
    for (const field in entityFields) {
      if (field in req.query) {
        let val: any = req.query[field];
        if (isNullValue(val)) {
          val = null;
        } else {
          switch (entityFields[field].type.key) {
            case "INTEGER":
            case "DECIMAL":
            case "DOUBLE":
            case "FLOAT":
              if (isNaN(val)) {
                throw new Error(INVALID_NUMBER);
              } else {
                val = +val
              }
              break;
            case "BOOLEAN":
              val = stringToBoolean(val);
              break;
            case "DATE":
            case "DATETIME":
            case "DATEONLY":
              if (!dateTimePattern.test(val)) {
                throw new Error(INVALID_DATE);
              } else {
                val = DateTime.fromISO(val)
              }
              break;
            default:
              val = req.query[field];
              break;
          }
        }
        where[field] = val;
      }
    }
    req.sequelizeQueryParser = {
      ...req.sequelizeQueryParser,
      where: where
    }
  }
  next();
}
