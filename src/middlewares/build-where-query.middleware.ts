import { NextFunction, Response } from "express";
import { RequestQueryParserInterface } from "../interfaces/request-query-parser.interface";
import moment from "moment";

export function buildWhere(req: RequestQueryParserInterface, res: Response, next: NextFunction) {
  const where: any = req.query?.where || {};
  if (req.queryParser) {
    const entityFields: any = req.queryParser.model.rawAttributes;
    for (const field in entityFields) {
      if (field in req.query) {
        let val: any = req.query[field];
        switch (entityFields[field].type.key) {
          case "INTEGER":
          case "DECIMAL":
          case "DOUBLE":
          case "FLOAT":
            val = isNull(val) ? null : +val;
            break;
          case "BOOLEAN":
            val = isNull(val) ? null : stringToBoolean(val);
            break;
          case "DATE":
          case "DATETIME":
          case "DATEONLY":
            val = isNull(val) ? null : moment(val)
            break;
          default:
            val = req.query[field];
            break;
        }
        where[field] = val;
      }
    }
    req.queryParser = {
      ...req.queryParser,
      where: where
    }
  }
  next();
}

function isNull(value: string): boolean {
  return value === "null" || value === "undefined";
}

function stringToBoolean(value: string) {
  switch (value.toLowerCase().trim()) {
    case "true":
    case "t":
    case "1":
      return true;
    case "false":
    case "f":
    case "0":
      return false;
    default:
      return null;
  }
}
