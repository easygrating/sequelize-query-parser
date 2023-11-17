import { Response, NextFunction } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces";
import { MODEL_NOT_CONFIGURED_ERROR } from "../core/constants";

export function buildAttributes(
  req: SequelizeQueryParserRequestInterface,
  res: Response,
  next: NextFunction
) {
  if (!req.query.attributes) return next();

  let rawAttributes: string[] = [];
  if ("string" === typeof req.query.attributes) {
    rawAttributes = req.query.attributes.split(",");
  } else if (Array.isArray(req.query.attributes)) {
    rawAttributes = req.query.attributes as string[];
  } else {
    return next();
  }

  const model = req.sequelizeQueryParser?.model;
  if (!model) throw new Error(MODEL_NOT_CONFIGURED_ERROR);

  const include: string[] = [];
  const exclude: string[] = [];
  const associations: any[] = [];
  rawAttributes.forEach((item) => {
    const attribute = item.split(".");
    if (attribute.length === 1) {
      if (attribute[0].includes("not:")) {
        exclude.push(attribute[0].replace("not:", ""));
      } else {
        include.push(attribute[0]);
      }
    } else {
      associations.push({
        associationPath: [
          attribute[0].replace("not:", ""),
          ...attribute.slice(1, attribute.length - 2),
        ],
        exclude: attribute[0].includes("not:"),
        attribute: attribute[attribute.length - 1],
      });
    }
  });

  req.sequelizeQueryParser = {
    ...req.sequelizeQueryParser,
    attributes: {
      include,
      exclude,
      associations,
    },
  };
  next();
}
