import { Response } from "express";
import { buildWhere } from "../../src";
import moment from "moment";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";

const db = require('../../example/db');

describe("Build where query middleware ", () => {
  it("should contain the where in the req with the params sended in the query from client", () => {
    const model = db["Province"];
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        name: "Sofia",
        order: "1",
        isValid: "true",
        fundation_date: "1000-01-01",
      },
      sequelizeQueryParser: { model }
    }
    const fakeNext = jest.fn();
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("where");
    expect(req.sequelizeQueryParser?.where).toHaveProperty("name");
    expect(req.sequelizeQueryParser?.where?.name).toEqual("Sofia");
    expect(req.sequelizeQueryParser?.where?.order).toEqual(1);
    expect(req.sequelizeQueryParser?.where?.isValid).toBeTruthy();
    expect(req.sequelizeQueryParser?.where?.fundation_date).toEqual(moment("1000-01-01"));
  });
  it("should contain the where in the req with the params sended in the query from client but all null", () => {
    const model = db["Province"];
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        order: "null",
        isValid: "undefined",
        fundation_date: "null",
      },
      sequelizeQueryParser: { model }
    }
    const fakeNext = jest.fn();
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("where");
    expect(req.sequelizeQueryParser?.where?.order).toBeNull();
    expect(req.sequelizeQueryParser?.where?.isValid).toBeNull();
    expect(req.sequelizeQueryParser?.where?.fundation_date).toBeNull();
  });
})
