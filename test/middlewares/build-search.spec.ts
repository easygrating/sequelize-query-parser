import { Response } from "express";
import { buildSearch } from "../../src/middlewares/build-search";
import {
  INVALID_SEARCH_ATTRIBUTES_ERROR,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
  WHERE_CLAUSE_NOT_FOUND_ERROR,
} from "../../src/core/constants";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";
import { Op } from "sequelize";

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        where: {},
      },
      query: { search: "foo" }, // Define query here
    };
    res = {
      status: jest.fn().mockReturnThis(), // Ensure 'status' returns 'this' (res) for chaining
      json: jest.fn(),
    } as unknown as Response; // Explicitly define res as Response
    next = jest.fn();
  });

  it("should skip to next middleware if req.query.search is not defined", () => {
    delete req.query.search;
    buildSearch(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid Sequelize 'where' object when req.query.search is valid", () => {
    const controlValue = {
      [Op.or]: [
        { name: { [Op.like]: "%foo%" } },
        { password: { [Op.like]: "%foo%" } },
      ],
    };
    buildSearch(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid Sequelize 'where' object when req.query.search and req.query.searchAttributes are valid", () => {
    req.query.searchAttributes = "password";
    const controlValue = { [Op.or]: [{ password: { [Op.like]: "%foo%" } }] };
    buildSearch(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid Sequelize 'where' object with the included model associations", () => {
    req.sequelizeQueryParser.model = db["Municipality"];
    req.sequelizeQueryParser.include = [{ association: "Province", required: false }];
    const controlValue = {
      [Op.or]: [
        { name: { [Op.like]: "%foo%" } },
        { code: { [Op.like]: "%foo%" } },
        { latitude: { [Op.like]: "%foo%" } },
        { longitude: { [Op.like]: "%foo%" } },
        { "Province.name": { [Op.like]: "%foo%" } },
        { "Province.code": { [Op.like]: "%foo%" } },
        { "Province.latitude": { [Op.like]: "%foo%" } },
        { "Province.longitude": { [Op.like]: "%foo%" } },
      ],
    };
    buildSearch(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return a valid Sequelize 'where' object with deep nested 'include' model associations", () => {
    req.query = { search: "foo", searchAttributes: "name" }
    req.sequelizeQueryParser.model = db["SocialEvent"];
    req.sequelizeQueryParser.include = [
      {
        association: "Album",
        include: [
          {
            association: "Images",
            required: false,
          },
        ],
        required: false,
      },
      {
        association: "Municipality",
        include: [
          {
            association: "Province",
            required: false,
          },
        ],
        required: false,
      },
    ];
    const controlValue = {
      [Op.or]: [
        { name: { [Op.like]: "%foo%" } },
        { "Album.name": { [Op.like]: "%foo%" } },
        { "Album.Municipality.name": { [Op.like]: "%foo%" } },
        { "Album.Municipality.Province.name": { [Op.like]: "%foo%" } },
      ],
    };
    buildSearch(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.where).toBeDefined();
    expect(req.sequelizeQueryParser.where).toEqual(controlValue);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw an error when a searchAttributes item does not exist in the model", () => {
    req.query.searchAttributes = "name,description";
    expect(() => {
      buildSearch(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(INVALID_SEARCH_ATTRIBUTES_ERROR);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser is not defined", () => {
    delete req.sequelizeQueryParser;
    expect(() => {
      buildSearch(
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
      buildSearch(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(MODEL_NOT_CONFIGURED_ERROR);
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser.where is not defined", () => {
    delete req.sequelizeQueryParser.where;
    expect(() => {
      buildSearch(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(WHERE_CLAUSE_NOT_FOUND_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
