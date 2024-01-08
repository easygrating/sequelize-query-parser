import { Response } from "express";
import { buildAssociations } from "../../src/middlewares";
import {
  INVALID_ASSOCIATION_PATH,
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
} from "../../src/core/constants";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";
import { parseStringWithParams } from "../../src/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build Include Middleware", () => {
  let req: Partial<SequelizeQueryParserRequestInterface> & {
    sequelizeQueryParser: any;
    query: any;
  };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      sequelizeQueryParser: {
        model: db["Municipality"],
      },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  it("should yield a valid include object", () => {
    req.query.include = "Province";
    const controlValue = [
      {
        association: "Province",
        required: false,
      },
    ];
    buildAssociations(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.associations).toBeDefined();
    expect(req.sequelizeQueryParser.associations).toStrictEqual(controlValue);
    expect(next).toHaveBeenCalled();
  });

  it("should call next middleware if no include", () => {
    buildAssociations(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.associations).not.toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it("should yield an empty include object when req.query.include is an empty string", () => {
    req.query.include = "";
    buildAssociations(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.associations).not.toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it("should yield a valid include object with deep associations", () => {
    req.sequelizeQueryParser.model = db["SocialEvent"];
    req.query.include = "Document,Album.Images";
    const controlValue = [
      {
        association: "Document",
        required: false,
      },
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
    ];
    buildAssociations(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );

    expect(req.sequelizeQueryParser.associations).toBeDefined();
    expect(req.sequelizeQueryParser.associations).toStrictEqual(controlValue);
    expect(next).toHaveBeenCalled();
  });

  it("should yield a valid include object with deep associations and sibling associations", () => {
    req.sequelizeQueryParser.model = db["Municipality"];
    req.query.include = "Events.Album,Events.Document.Author";
    const controlValue = [
      {
        association: "Events",
        required: false,
        include: [
          {
            association: "Album",
            required: false,
          },
          {
            association: "Document",
            required: false,
            include: [
              {
                association: "Author",
                required: false,
              },
            ],
          },
        ],
      },
    ];
    buildAssociations(
      req as SequelizeQueryParserRequestInterface,
      res as Response,
      next
    );
    expect(req.sequelizeQueryParser.associations).toBeDefined();
    expect(req.sequelizeQueryParser.associations).toStrictEqual(controlValue);
    expect(next).toHaveBeenCalled();
  });

  it("should throw an error when req.query.include has an invalid first level association", () => {
    req.query.include = "Radio";
    expect(() => {
      buildAssociations(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(
      parseStringWithParams(
        INVALID_ASSOCIATION_PATH,
        req.query.include,
        "Municipality"
      )
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.query.include has an invalid deep association", () => {
    req.query.include = "Province.Radio";
    expect(() => {
      buildAssociations(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(
      parseStringWithParams(
        INVALID_ASSOCIATION_PATH,
        req.query.include,
        "Municipality"
      )
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.query.include has an invalid format", () => {
    req.query.include = "Province.";
    expect(() => {
      buildAssociations(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(
      parseStringWithParams(
        INVALID_ASSOCIATION_PATH,
        req.query.include,
        "Municipality"
      )
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error when req.sequelizeQueryParser is not defined", () => {
    delete req.sequelizeQueryParser;
    expect(() => {
      buildAssociations(
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
      buildAssociations(
        req as SequelizeQueryParserRequestInterface,
        res as Response,
        next
      );
    }).toThrow(MODEL_NOT_CONFIGURED_ERROR);
    expect(next).not.toHaveBeenCalled();
  });
});
