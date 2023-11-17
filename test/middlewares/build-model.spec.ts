import { Response } from "express";
import { buildModel } from "../../src/index";
import { MODEL_NOT_FOUND_ERROR } from "../../src/core/constants";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";

const db = require("./../../example/db");
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

  it("must load Province model into sequelizeQueryParser request object matching with route param", () => {
    const middleware = buildModel(db);
    const request: Partial<SequelizeQueryParserRequestInterface> = {
      params: { model: "provinces" },
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("sequelizeQueryParser");
    expect(request.sequelizeQueryParser).toHaveProperty("model");
    expect(request.sequelizeQueryParser?.model).toHaveProperty("name");
    expect(request.sequelizeQueryParser?.model?.name).toEqual("Province");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });

  it("must load Province model into sequelizeQueryParser request object matching with a given model name", () => {
    const middleware = buildModel(db, "Municipality");
    const request: Partial<SequelizeQueryParserRequestInterface> = {
      params: {},
    };
    middleware(request as any, {} as Response, fakeNext);
    expect(request).toHaveProperty("sequelizeQueryParser");
    expect(request.sequelizeQueryParser).toHaveProperty("model");
    expect(request.sequelizeQueryParser?.model).toHaveProperty("name");
    expect(request.sequelizeQueryParser?.model?.name).toEqual("Municipality");
    expect(fakeNext.mock.calls).toHaveLength(1);
  });
});
