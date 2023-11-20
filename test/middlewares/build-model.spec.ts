import { Response } from "express";
import { buildModel } from "../../src/index";
import { MODEL_NOT_FOUND_ERROR } from "../../src/core/constants";
import { RequestQueryParserInterface } from "../../src/interfaces/request-query-parser.interface";


const db = require("../../example/db");
describe("Build Model Middleware", () => {
  let fakeNext: jest.Mock;

  beforeEach(() => {
    fakeNext = jest.fn();
  });

  it("must throw an error if model param is not associate with an existing model and not call next", () => {
    const middleware = buildModel(db);
    expect(() =>
      middleware({ params: { model: "pet" } } as any, {} as Response, fakeNext)
    ).toThrow(MODEL_NOT_FOUND_ERROR);
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  it("must throw an error if modelName is not associated with an existing model and not call next", () => {
    const middleware = buildModel(db, "pet");
    expect(() =>
      middleware({ params: {} } as any, {} as Response, fakeNext)
    ).toThrow(MODEL_NOT_FOUND_ERROR);
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  it("must load Province model into queryParser request object matching with route param", () => {
    const middleware = buildModel(db);
    const request: Partial<RequestQueryParserInterface> = {
      params: { model: "provinces" },
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("queryParser");
    expect(request.queryParser).toHaveProperty("model");
    expect(request.queryParser?.model).toHaveProperty("name");
    expect(request.queryParser?.model.name).toEqual("Province");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });

  it("must load Province model into queryParser request object matching with a given model name", () => {
    const middleware = buildModel(db, "Municipality");
    const request: Partial<RequestQueryParserInterface> = {
      params: {},
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("queryParser");
    expect(request.queryParser).toHaveProperty("model");
    expect(request.queryParser?.model).toHaveProperty("name");
    expect(request.queryParser?.model.name).toEqual("Municipality");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });
});
