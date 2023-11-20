import { Response } from "express";
import { buildWhere } from "../../src";
import { RequestQueryParserInterface } from "../../src/interfaces/request-query-parser.interface";
import moment from "moment";

const db = require('../../example/db');

describe("Build where query middleware ", () => {
  it("should contain the where in the req with the params sended in the query from client", () => {
    const model = db["Province"];
    const req: Partial<RequestQueryParserInterface> = {
      query: {
        name: "Sofia",
        order: "1",
        isValid: "true",
        fundation_date: "1000-01-01",
      },
      queryParser: { model }
    }
    const fakeNext = jest.fn();
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req).toHaveProperty("queryParser");
    expect(req.queryParser).toHaveProperty("where");
    expect(req.queryParser?.where).toHaveProperty("name");
    expect(req.queryParser?.where?.name).toEqual("Sofia");
    expect(req.queryParser?.where?.order).toEqual(1);
    expect(req.queryParser?.where?.isValid).toBeTruthy();
    expect(req.queryParser?.where?.fundation_date).toEqual(moment("1000-01-01"));
  });
  it("should contain the where in the req with the params sended in the query from client but all null", () => {
    const model = db["Province"];
    const req: Partial<RequestQueryParserInterface> = {
      query: {
        order: "null",
        isValid: "undefined",
        fundation_date: "null",
      },
      queryParser: { model }
    }
    const fakeNext = jest.fn();
    buildWhere(req as any, {} as Response, fakeNext);
    expect(req).toHaveProperty("queryParser");
    expect(req.queryParser).toHaveProperty("where");
    expect(req.queryParser?.where?.order).toBeNull();
    expect(req.queryParser?.where?.isValid).toBeNull();
    expect(req.queryParser?.where?.fundation_date).toBeNull();
  });
})
