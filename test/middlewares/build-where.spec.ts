import { Response } from "express";
import { buildWhere } from "../../src/middlewares/build-where";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";
import { DateTime } from "luxon";
import { INVALID_DATE, INVALID_NUMBER } from "../../src/core/constants";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build where query middleware ", () => {
  let fakeNext: jest.Mock;

  beforeEach(() => {
    fakeNext = jest.fn();
  });
  const model = db["Province"];

  it("should contain the where in the req with the params sended in the query from client", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        name: "Sofia",
        order: "1",
        isValid: "true",
        fundation_date: "1000-01-01",
      },
      sequelizeQueryParser: { model },
    };
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("where");
    expect(req.sequelizeQueryParser?.where).toHaveProperty("name");
    expect(req.sequelizeQueryParser?.where?.name).toEqual("Sofia");
    expect(req.sequelizeQueryParser?.where?.order).toEqual(1);
    expect(req.sequelizeQueryParser?.where?.isValid).toBeTruthy();
    expect(req.sequelizeQueryParser?.where?.fundation_date).toEqual(
      DateTime.fromISO("1000-01-01")
    );
  });

  it("should contain the where in the req with the params sended in the query from client but all null", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        order: "null",
        isValid: "false",
        fundation_date: "null",
      },
      sequelizeQueryParser: { model },
    };
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req.sequelizeQueryParser?.where?.order).toBeNull();
    expect(req.sequelizeQueryParser?.where?.isValid).toBeFalsy();
    expect(req.sequelizeQueryParser?.where?.fundation_date).toBeNull();
  });

  it("should throw an error on invalid number format", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        order: "invalid_number",
      },
      sequelizeQueryParser: { model },
    };
    expect(() => buildWhere(req as any, {} as Response, fakeNext)).toThrow(
      INVALID_NUMBER
    );
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  it("should throw an error on invalid date format", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        fundation_date: "invalid_date",
      },
      sequelizeQueryParser: { model },
    };
    expect(() => buildWhere(req as any, {} as Response, fakeNext)).toThrow(
      INVALID_DATE
    );
    expect(fakeNext.mock.calls).toHaveLength(0);
  });
});
