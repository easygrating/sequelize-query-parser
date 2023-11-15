import { Response } from "express";
import { buildModel } from "../src/index";
import { MODEL_NOT_FOUND_ERROR } from "../src/constants";
import { SequelizeQueryParserRequestInterface } from "../src/interfaces";

const db = require("../example/db");
describe("Build Model Middleware", () => {
  test("Must throw an error if model param is not associate with an existing model and not call next", () => {
    const middleware = buildModel(db);
    const fakeNext = jest.fn();
    expect(() =>
      middleware({ params: { model: "pet" } } as any, {} as Response, fakeNext)
    ).toThrow(MODEL_NOT_FOUND_ERROR);
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  test("Must throw an error if modelName is not associate with an existing model and not call next", () => {
    const middleware = buildModel(db, "pet");
    const fakeNext = jest.fn();
    expect(() =>
      middleware({ params: {} } as any, {} as Response, fakeNext)
    ).toThrow(MODEL_NOT_FOUND_ERROR);
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  test("It must load Province model into sequelizeQueryParser request object matching with route param", () => {
    const middleware = buildModel(db);
    const fakeNext = jest.fn();
    const request: Partial<SequelizeQueryParserRequestInterface> = {
      params: { model: "provinces" },
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("sequelizeQueryParser");
    expect(request.sequelizeQueryParser).toHaveProperty("model");
    expect(request.sequelizeQueryParser?.model).toHaveProperty("name");
    expect(request.sequelizeQueryParser?.model.name).toEqual("Province");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });

  test("It must load Province model into sequelizeQueryParser request object matching with a given model name", () => {
    const middleware = buildModel(db, "Municipality");
    const fakeNext = jest.fn();
    const request: Partial<SequelizeQueryParserRequestInterface> = {
      params: {},
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("sequelizeQueryParser");
    expect(request.sequelizeQueryParser).toHaveProperty("model");
    expect(request.sequelizeQueryParser?.model).toHaveProperty("name");
    expect(request.sequelizeQueryParser?.model.name).toEqual("Municipality");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });
});
