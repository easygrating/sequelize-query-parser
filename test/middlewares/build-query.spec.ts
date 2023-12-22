import { Response } from "express";
import { SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR } from "../../src/core/constants";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";
import { buildQuery } from "../../src/middlewares";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build Query Middleware", () => {
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

  it("should create a query object", () => {
    delete req.sequelizeQueryParser.model;
    const middleware = buildQuery();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.query).toBeDefined();
    expect(req.sequelizeQueryParser.query).toHaveProperty("offset");
    expect(req.sequelizeQueryParser.query).toHaveProperty("limit");
    expect(req.sequelizeQueryParser.query).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when req.sequelizeQueryParser is not defined", () => {
    delete req.sequelizeQueryParser;
    const middleware = buildQuery();
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
