import { Response, NextFunction } from "express";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces/sequelize-query-parser-request.interface";
import {
  INVALID_INCLUDE,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
} from "../core/constants";
import { parseStringWithParams } from "../utils";
import { hasIn } from "lodash";
import { IncludeObject } from "../core/interfaces/include-object.interface";

export function buildInclude(
  req: SequelizeQueryParserRequestInterface,
  res: Response,
  next: NextFunction
) {
  // Check if necessary Sequelize query parser data exists
  if (!req.sequelizeQueryParser)
    throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
  if (!req.sequelizeQueryParser.model)
    throw new Error(MODEL_NOT_CONFIGURED_ERROR);

  const model = req.sequelizeQueryParser.model;
  let include;
  if (!req.query.include) {
    include = [];
  } else {
    let valid = false;
    const includes = (req.query.include as string).split(",");
    includes.forEach((includeItem) => {
      const checkInclude = includeItem.split(".").join(".target.associations.");
      valid = hasIn(model, "associations." + checkInclude);
      if (!valid) {
        throw new Error(parseStringWithParams(INVALID_INCLUDE, model.name));
      }
    });
    include = buildIncludeArray(req.query.include as string);
  }

  // Add the include array to the request object for later use
  req.sequelizeQueryParser.include = include;
  next();
}

function buildIncludeArray(associationsString: string): IncludeObject[] {
  // Split the string into individual associations
  const associations = associationsString.split(",");

  // Map each association to an object
  const include: IncludeObject[] = associations.map((association) => {
    // Split nested associations
    const nestedAssociations = association.split(".").reverse();

    // Build the include object recursively
    let includeObject: IncludeObject = {
      association: nestedAssociations[0],
      required: false,
    };

    for (let i = 1; i < nestedAssociations.length; i++) {
      includeObject = {
        association: nestedAssociations[i],
        required: false,
        include: [includeObject],
      };
    }

    return includeObject;
  });

  return include;
}
