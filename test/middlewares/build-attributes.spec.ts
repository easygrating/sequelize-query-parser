import { NextFunction, Response } from "express";
import { buildAttributes } from "../../src/middlewares/build-attributes";
import {
  MODEL_NOT_CONFIGURED_ERROR,
  SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR,
} from "../../src/core/constants";
import { AssociationsAttributesConfig } from "../../src/core/interfaces/associations-attributes-config.interface";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build Attribute Middleware", () => {
  let fakeNext: NextFunction;
  let req: Partial<SequelizeQueryParserRequestInterface> & {
    sequelizeQueryParser: any;
    query: any;
  };
  let res: Response;
  beforeEach(() => {
    fakeNext = jest.fn();
    req = {
      sequelizeQueryParser: {
        model: db["Province"],
      },
      query: {
        attributes: "name,code",
      }, // Define query here
    };
    res = {} as Response;
  });

  it("must build an include array with valid model attributes from a request query", () => {
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).toHaveProperty("attributes");
    expect(req.sequelizeQueryParser.attributes?.include).toHaveLength(2);
    expect(req.sequelizeQueryParser.attributes?.exclude).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.associations).toHaveLength(0);
    expect(["name", "code"]).toEqual(
      expect.arrayContaining(req.sequelizeQueryParser.attributes?.include ?? [])
    );
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must build an exclude array with valid model attributes from a request query", () => {
    req.query = {
      attributes: "not:id",
    };
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).toHaveProperty("attributes");
    expect(req.sequelizeQueryParser.attributes?.include).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.exclude).toHaveLength(1);
    expect(req.sequelizeQueryParser.attributes?.associations).toHaveLength(0);
    expect(["id"]).toEqual(req.sequelizeQueryParser.attributes?.exclude ?? []);
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must build an association array with valid model association attributes from a request query", () => {
    req.query = {
      attributes: "Municipalities.name,not:Municipalities.id",
    };
    const parsedAssociationAttributes: AssociationsAttributesConfig[] = [
      {
        associationPath: ["Municipalities"],
        attribute: "name",
        exclude: false,
      },
      {
        associationPath: ["Municipalities"],
        attribute: "id",
        exclude: true,
      },
    ];
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).toHaveProperty("attributes");
    expect(req.sequelizeQueryParser.attributes?.include).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.exclude).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.associations).toHaveLength(2);
    expect(parsedAssociationAttributes).toEqual(
      expect.arrayContaining(
        req.sequelizeQueryParser.attributes?.associations ?? []
      )
    );
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must call next if no attributes were provide in query", () => {
    req.query = {};
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).not.toHaveProperty("attributes");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must call next if query.attributes is in an unknown format", () => {
    req.query = { attributes: { name: "name" } };
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).not.toHaveProperty("attributes");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must parse the query attributes if attribute is a string array", () => {
    req.query = {
      attributes: ["name", "id"],
    };
    buildAttributes(req as SequelizeQueryParserRequestInterface, res, fakeNext);
    expect(req.sequelizeQueryParser).toHaveProperty("attributes");
    expect(req.sequelizeQueryParser.attributes?.include).toHaveLength(2);
    expect(req.sequelizeQueryParser.attributes?.exclude).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.associations).toHaveLength(0);
    expect(["name", "id"]).toEqual(
      expect.arrayContaining(req.sequelizeQueryParser.attributes?.include ?? [])
    );
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must throw an error if req.sequelizeQueryParser is not defined in the request", () => {
    delete req.sequelizeQueryParser;
    expect(() =>
      buildAttributes(
        req as SequelizeQueryParserRequestInterface,
        res,
        fakeNext
      )
    ).toThrow(SEQUELIZE_QUERY_PARSER_DATA_NOT_FOUND_ERROR);
  });

  it("must throw an error if there isn't a model in the request", () => {
    delete req.sequelizeQueryParser.model;
    expect(() =>
      buildAttributes(
        req as SequelizeQueryParserRequestInterface,
        res,
        fakeNext
      )
    ).toThrow(MODEL_NOT_CONFIGURED_ERROR);
  });
});
