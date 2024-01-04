import { Response, NextFunction } from "express";
import {
  SequelizeQueryParserRequestInterface,
  IncludeObject,
} from "../core/interfaces";
import {
  INVALID_INCLUDE,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
} from "../core/constants";
import { parseStringWithParams } from "../utils";
import { hasIn } from "lodash";
import { Tree } from "@easygrating/easytree";

/**
 * Middleware to build the include array for Sequelize queries based on request parameters.
 * @param req - Express request object with SequelizeQueryParserRequestInterface
 * @param res - Express response object
 * @param next - Express next function
 * @throws {Error} SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR if necessary Sequelize query parser data is missing
 * @throws {Error} MODEL_NOT_CONFIGURED_ERROR if the model is not configured in the request
 */
export function buildInclude(
  req: SequelizeQueryParserRequestInterface,
  res: Response,
  next: NextFunction
) {
  if (!req.sequelizeQueryParser)
    throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
  if (!req.sequelizeQueryParser.model)
    throw new Error(MODEL_NOT_CONFIGURED_ERROR);

  const model = req.sequelizeQueryParser.model;
  if (!req.query.include) {
    return next();
  }

  let valid = false;
  const includes = (req.query.include as string).split(",");
  includes.forEach((includeItem) => {
    const checkInclude = includeItem.split(".").join(".target.associations.");
    valid = hasIn(model, "associations." + checkInclude);
    if (!valid) {
      throw new Error(parseStringWithParams(INVALID_INCLUDE, model.name));
    }
  });
  const associationTree = buildAssociations(req.query.include as string);
  req.sequelizeQueryParser.include = associationTree.include;
  next();
}

/**
 * Builds an array of IncludeObject based on associations string.
 * @param associationsString - Comma-separated string of associations in dot notation
 * @returns {IncludeObject} Array of IncludeObject for Sequelize queries
 */
function buildAssociations(associationsString: string): IncludeObject {
  const associations = associationsString.split(",");
  const tree = new Tree("root", { include: [] } as Partial<IncludeObject>);
  associations.forEach((item) => processPath(tree, item));
  return tree.toJSON<IncludeObject>("include");
}

/**
 * Process an association path and add it to the association tree
 * @param tree association tree
 * @param path association path in dot notation
 */
function processPath(tree: Tree<unknown>, path: string) {
  let pointer = tree.id;
  const splitPath = path.split(".");
  for (let i = 0; i < splitPath.length; i++) {
    // Node id is built from the begining of the array to the current path to avoid duplicated association conflicts
    const id = splitPath.slice(0, i + 1).join();
    tree.addChildAt(
      new Tree(id, { association: splitPath[i], required: false }),
      pointer
    );
    pointer = id;
  }
}
