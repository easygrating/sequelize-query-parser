import { Response } from "express";
import { orderModel } from "./../../src/middlewares/order-model";
import { col } from "sequelize";
import { SequelizeQueryParserRequestInterface } from "../../src/interfaces";
import {
  ORDER_SORT_ASC,
  ORDER_SORT_DESC,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  TIMESTAMP_ATTRIBUTE,
} from "../../src/constants";

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

  it("should set default order when req.query.order is undefined", async () => {
    const middleware = orderModel();
    await middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([
      [col(TIMESTAMP_ATTRIBUTE), ORDER_SORT_DESC],
    ]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should set order by id when req.query.order is undefined and timestamps are disabled", async () => {
    req.sequelizeQueryParser.model = db["Province"];
    const middleware = orderModel();
    await middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([[col("id"), ORDER_SORT_DESC]]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid order when req.query.order is defined", async () => {
    req.query.order = "name:asc";
    const middleware = orderModel();
    await middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.order).toBeDefined();
    expect(req.sequelizeQueryParser.order).toEqual([[col("name"), ORDER_SORT_ASC]]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when attribute specified in req.query.order does not exist in the model", async () => {
    req.query.order = "invalidAttribute:asc";
    const middleware = orderModel();
    await expect(async () => {
      await middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).rejects.toThrow(
      `Attribute 'invalidAttribute' was not found in the model`
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser or req.sequelizeQueryParser.model is not defined", async () => {
    req.sequelizeQueryParser = undefined;
    const middleware = orderModel();
    await expect(async () => {
      await middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).rejects.toThrow(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
