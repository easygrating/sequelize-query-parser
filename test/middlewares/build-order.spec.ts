import { Response } from "express";
import { col } from "sequelize";
import {
  ATTRIBUTE_NOT_FOUND_ERROR,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  TIMESTAMP_ATTRIBUTE,
} from "../../src/core/constants";
import { SortOrder } from "../../src/core/enums";
import { parseStringWithParams } from "../../src/utils";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";
import { buildOrder } from "../../src/middlewares";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build Order Middleware", () => {
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
    buildOrder(
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
    buildOrder(
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
    buildOrder(
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
    expect(() => {
      buildOrder(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(
      parseStringWithParams(ATTRIBUTE_NOT_FOUND_ERROR, "invalidAttribute")
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser is not defined", () => {
    delete req.sequelizeQueryParser;
    expect(() => {
      buildOrder(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser.model is not defined", () => {
    delete req.sequelizeQueryParser.model;
    expect(() => {
      buildOrder(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(MODEL_NOT_CONFIGURED_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
