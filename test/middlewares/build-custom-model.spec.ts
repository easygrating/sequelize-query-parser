import { Response } from "express";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces/sequelize-query-parser-request.interface";
import { buildCustomModel } from "../../src/middlewares/build-custom-model";
import path from "path";
import * as nmodulesLoader from "@easygrating/nmodules-loader";
import { CustomModelMiddlewareInterface } from "../../src/core/interfaces/custom-model-middleware.interface";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build Custom Model", () => {
  let fakeNext: jest.Mock;
  let req: Partial<SequelizeQueryParserRequestInterface>;
  let res: Response;
  let customMiddlewares: CustomModelMiddlewareInterface[];

  beforeEach(() => {
    fakeNext = jest.fn();
    req = {
      sequelizeQueryParser: {},
      params: {},
    };
    res = {} as Response;
    customMiddlewares = nmodulesLoader.loadModules(
      "./example/customMiddlewares"
    );
    customMiddlewares.forEach((item) => (item.customMiddleware = jest.fn()));
  });

  it("must call next if no custom middleware is found", () => {
    req.params = {
      model: "pets",
    };
    const middleware = buildCustomModel(
      path.resolve("./example/customMiddlewares")
    );

    middleware(req as any, res, fakeNext);
    const customCalls = customMiddlewares.filter(
      (item) => (item.customMiddleware as jest.Mock).mock.calls.length
    );

    expect(customCalls).toHaveLength(0);
    expect(fakeNext.mock.calls).toHaveLength(1);
  });

  it("must call customMiddleware function from custom workout middleware by route param", () => {
    req.params = {
      model: "workouts",
    };
    const middleware = buildCustomModel(
      path.resolve("./example/customMiddlewares")
    );
    middleware(req as any, res, fakeNext);
    expect(fakeNext.mock.calls).toHaveLength(0);
    const usedMiddleware = customMiddlewares.find(
      (item) => item.route === req.params?.model
    );
    expect(usedMiddleware?.customMiddleware).toHaveBeenCalledTimes(1);
    const customCalls = customMiddlewares.filter(
      (item) => (item.customMiddleware as jest.Mock).mock.calls.length
    );
    expect(customCalls).toHaveLength(1);
  });

  it("must call customMiddleware function from custom user middleware by model name", () => {
    req.sequelizeQueryParser = {
      model: db["User"],
    };
    const middleware = buildCustomModel(
      path.resolve("./example/customMiddlewares")
    );
    middleware(req as any, res, fakeNext);
    expect(fakeNext.mock.calls).toHaveLength(0);
    const usedMiddleware = customMiddlewares.find(
      (item) => item.modelName === req.sequelizeQueryParser?.model?.name
    );
    expect(usedMiddleware?.customMiddleware).toHaveBeenCalledTimes(1);
    const customCalls = customMiddlewares.filter(
      (item) => (item.customMiddleware as jest.Mock).mock.calls.length
    );
    expect(customCalls).toHaveLength(1);
  });
});
