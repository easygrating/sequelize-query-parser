import { Response } from "express";
import {
  INVALID_SEARCH_ATTRIBUTES_ERROR,
  INVALID_SEARCH_VALUE_ERROR,
} from "../../src/core/constants";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";
import { buildSearch } from "../../src/middlewares/build-search";
import { parseStringWithParams } from "../../src/utils";
import { Op } from "sequelize";

const db = require("./../../example/db");
describe("Build Search Middleware", () => {
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

  it("should return a valid Sequelize 'where' object when req.query.search is valid", () => {
    req.query.search = "foo";
    const controlValue = {
      [Op.or]: [
        { name: { [Op.like]: "%foo%" } },
        { password: { [Op.like]: "%foo%" } },
      ],
    };
    const middleware = buildSearch();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid Sequelize 'where' object when req.query.search and req.query.searchAttributes are valid ", () => {
    req.query.search = "foo";
    req.query.searchAttributes = "password";
    const controlValue = { [Op.or]: [{ password: { [Op.like]: "%foo%" } }] };
    const middleware = buildSearch();
    middleware(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when a search has a boolean value", () => {
    req.query.search = "true";
    req.query.searchAttributes = "name";
    const middleware = buildSearch();
    expect(() => {
      middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(parseStringWithParams(INVALID_SEARCH_VALUE_ERROR, "true"));
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when a searchAttribute does not exist in the model", () => {
    req.query.search = "foo";
    req.query.searchAttributes = "name,description";
    const middleware = buildSearch();
    expect(() => {
      middleware(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(INVALID_SEARCH_ATTRIBUTES_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
