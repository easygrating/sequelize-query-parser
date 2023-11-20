import { NextFunction, Response } from "express";
import { buildAttributes } from "../../src/middlewares/build-attribute";
import { MODEL_NOT_CONFIGURED_ERROR } from "../../src/core/constants";
import { AssociationsAttributesConfig } from "../../src/core/interfaces/associations-attributes-config.interface";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";
const db = require("../../example/db/index");

describe("Build Attribute Middleware", () => {
  let fakeNext: NextFunction;
  let req: SequelizeQueryParserRequestInterface;
  let res: Response;
  beforeEach(() => {
    fakeNext = jest.fn();
    req = {} as unknown as SequelizeQueryParserRequestInterface;
    res = {} as Response;
  });

  it("must build an include array with valid model attributes from a request query", () => {
    req.query = {
      attributes: "name,code",
    };
    req.sequelizeQueryParser = {
      model: db["Province"],
    };
    buildAttributes(req, res, fakeNext);
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
    req.sequelizeQueryParser = {
      model: db["Province"],
    };
    buildAttributes(req, res, fakeNext);
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
    req.sequelizeQueryParser = {
      model: db["Province"],
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
    buildAttributes(req, res, fakeNext);
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
    req.sequelizeQueryParser = {
      model: db["Province"],
    };
    buildAttributes(req, res, fakeNext);
    expect(req.sequelizeQueryParser).not.toHaveProperty("attributes");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must call next if query.attributes is in an unknown format", () => {
    req.query = { attributes: { name: "name" } };
    req.sequelizeQueryParser = {
      model: db["Province"],
    };
    buildAttributes(req, res, fakeNext);
    expect(req.sequelizeQueryParser).not.toHaveProperty("attributes");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must parse the query attributes if attribute is a string array", () => {
    req.query = {
      attributes: ["name", "id"],
    };
    req.sequelizeQueryParser = {
      model: db["Province"],
    };
    buildAttributes(req, res, fakeNext);
    expect(req.sequelizeQueryParser).toHaveProperty("attributes");
    expect(req.sequelizeQueryParser.attributes?.include).toHaveLength(2);
    expect(req.sequelizeQueryParser.attributes?.exclude).toHaveLength(0);
    expect(req.sequelizeQueryParser.attributes?.associations).toHaveLength(0);
    expect(["name", "id"]).toEqual(
      expect.arrayContaining(req.sequelizeQueryParser.attributes?.include ?? [])
    );
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("must throw an error if there isn't a model in the request", () => {
    req.query = { attributes: "name,code" };
    req.sequelizeQueryParser = {};
    expect(() => buildAttributes(req, res, fakeNext)).toThrow(
      MODEL_NOT_CONFIGURED_ERROR
    );
  });
});
