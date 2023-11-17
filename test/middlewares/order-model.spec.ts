import { Response } from "express";
import { orderModel } from "./../../src/middlewares/order-model";
import { col } from "sequelize";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";
import {
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  TIMESTAMP_ATTRIBUTE,
} from "../../src/core/constants";
import { SortOrder } from "../../src/core/enums";

const db = require("./../../example/db");
describe("Order Middleware", () => {
  let req: Partial<SequelizeQueryParserRequestInterface> & {
    sequelizeQueryParser: any;
    query: any;
  };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      sequelizeQueryParser: {
        model: db["User"],
        order: null,
      },
      query: {}, // Define query here
    };
    res = {
      status: jest.fn().mockReturnThis(), // Ensure 'status' returns 'this' (res) for chaining
      json: jest.fn(),
    } as unknown as Response; // Explicitly define res as Response
    next = jest.fn();
  });

  it("should set default order when req.query.order is undefined", () => {
    const middleware = orderModel();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([
      [col(TIMESTAMP_ATTRIBUTE), SortOrder.ORDER_SORT_DESC],
    ]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should set order by id when req.query.order is undefined and timestamps are disabled", () => {
    req.sequelizeQueryParser.model = db["Province"];
    const middleware = orderModel();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([
      [col("id"), SortOrder.ORDER_SORT_DESC],
    ]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid order when req.query.order is defined", () => {
    req.query.order = "name:asc";
    const middleware = orderModel();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([
      [col("name"), SortOrder.ORDER_SORT_ASC],
    ]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when attribute specified in req.query.order does not exist in the model", () => {
    req.query.order = "invalidAttribute:asc";
    const middleware = orderModel();
    expect(() => {
      middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(`Attribute 'invalidAttribute' was not found in the model`);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser or req.sequelizeQueryParser.model is not defined", () => {
    req.sequelizeQueryParser = undefined;
    const middleware = orderModel();
    expect(() => {
      middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
