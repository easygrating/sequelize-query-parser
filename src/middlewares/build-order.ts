import { NextFunction, Response } from "express";
import { col } from "sequelize";
import {
  ATTRIBUTE_NOT_FOUND_ERROR,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  TIMESTAMP_ATTRIBUTE,
} from "../core/constants";
import { SortOrder } from "../core/enums";
import { parseStringWithParams } from "../utils";
import { OrderType } from "../core/types";
import { SequelizeQueryParserRequestInterface } from "../core/interfaces";

/**
 * Middleware that generates a Sequelize query order object based on the `req.query.order` value.
 * For instance, if `req.query.order` is `date:desc,name:asc`, the resulting Sequelize order object will be:
 *
 * [
 *   [col('date'), 'DESC'],
 *   [col('name'), 'ASC']
 * ]
 *
 * If `req.query.order` is not defined, the default order is applied using the `createdAt` attribute,
 * retrieved from the model's attributes, or the `primaryKey` in descending order if `createdAt` is absent.
 *
 * Note: This middleware relies on the preceding use of the `buildModel()` middleware located at `./build-model.ts`
 * to access the correct value from `req.sequelizeQueryParser.model`.
 *
 * @throws {Error} Throws an error if `req.sequelizeQueryParser` or `req.sequelizeQueryParser.model` is not present.
 * @throws {Error} Throws an error if an attribute specified in `req.query.order` does not exist in the model.
 *
 * @returns {Function} Express middleware function.
 */
export function buildOrder(req: SequelizeQueryParserRequestInterface, res: Response, next: NextFunction) {
  // Check if necessary Sequelize query parser data exists
  if (!req.sequelizeQueryParser) throw new Error(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
  if (!req.sequelizeQueryParser.model) throw new Error(MODEL_NOT_CONFIGURED_ERROR);

  const model = req.sequelizeQueryParser.model;
  const primaryKey = model.primaryKeyAttribute;
  const timestampKey = !!model.options.timestamps && TIMESTAMP_ATTRIBUTE;
  const attributes = Object.keys(model.rawAttributes);

  let order: OrderType[] = [
    [
      col(timestampKey ? timestampKey : primaryKey),
      SortOrder.ORDER_SORT_DESC,
    ],
  ];

  const rawOrder = req.query.order;
  if (rawOrder && typeof rawOrder === "string") {
    const parsedOrder = rawOrder.split(",").map<OrderType>((item) => {
      const [column, direction] = item.split(":");
      // Check if the specified column exists in the model's attributes
      if (!attributes.includes(column)) {
        // Handle when the attribute doesn't exist in the model
        throw new Error(
          parseStringWithParams(ATTRIBUTE_NOT_FOUND_ERROR, column)
        );
      }
      return [col(column), direction.toUpperCase() as SortOrder];
    });
    order = parsedOrder;
  }

  req.sequelizeQueryParser.order = order;

  next();
}
