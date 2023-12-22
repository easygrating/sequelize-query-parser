import { Response } from "express";
import { Op } from "sequelize";
import { parseStringWithParams } from "../../src/utils";
import { SequelizeQueryParserRequestInterface } from "../../src/core/interfaces";
import { buildFilter } from "../../src/middlewares";
import { INVALID_FILTER, MODEL_ATTRIBUTE_NOT_FOUND } from "../../src/core/constants";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("./../../example/db");

describe("Build filter query middleware ", () => {
  let fakeNext: jest.Mock;

  beforeEach(() => {
    fakeNext = jest.fn();
  });
  const model = db["User"];

  it("should contain the filter property in the request with a valid filter object", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        filter: ["name.david", "age.lte.40", "age.not.eq.33"],
      },
      sequelizeQueryParser: { model },
    };
    buildFilter(req as any, {} as Response, fakeNext);

    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("filter");
    expect(req.sequelizeQueryParser?.filter).toHaveProperty("name");
    expect(req.sequelizeQueryParser?.filter?.name).toEqual("david");

    expect(req.sequelizeQueryParser?.filter).toHaveProperty("age");
    expect(req.sequelizeQueryParser?.filter?.age).toHaveProperty([Op.lte]);
    expect(req.sequelizeQueryParser?.filter?.age[Op.lte]).toEqual("40");

    expect(req.sequelizeQueryParser?.filter?.age).toHaveProperty([Op.not]);
    expect(req.sequelizeQueryParser?.filter?.age[Op.not]).toHaveProperty([
      Op.eq,
    ]);
    expect(req.sequelizeQueryParser?.filter?.age[Op.not][Op.eq]).toEqual("33");

    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("should work with array paths", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        filter: [
          "birthDate.between[0].1990-01-01",
          "birthDate.between[1].1999-12-31",
        ],
      },
      sequelizeQueryParser: { model },
    };
    buildFilter(req as any, {} as Response, fakeNext);

    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("filter");
    expect(req.sequelizeQueryParser?.filter).toHaveProperty("birthDate");
    expect(req.sequelizeQueryParser?.filter?.birthDate).toHaveProperty([
      Op.between,
    ]);
    expect(req.sequelizeQueryParser?.filter?.birthDate[Op.between].length).toBe(
      2
    );
    expect(["1990-01-01", "1999-12-31"]).toEqual(
      expect.arrayContaining(
        req.sequelizeQueryParser?.filter?.birthDate?.between ?? []
      )
    );
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("should work with a single filter query", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        filter: "age.40",
      },
      sequelizeQueryParser: { model },
    };
    buildFilter(req as any, {} as Response, fakeNext);

    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).toHaveProperty("filter");
    expect(req.sequelizeQueryParser?.filter).toHaveProperty("age");
    expect(req.sequelizeQueryParser?.filter?.age).toEqual("40");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("should call next if no filter is provided", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {},
      sequelizeQueryParser: { model },
    };
    buildFilter(req as any, {} as Response, fakeNext);

    expect(req).toHaveProperty("sequelizeQueryParser");
    expect(req.sequelizeQueryParser).not.toHaveProperty("filter");
    expect(fakeNext).toHaveBeenCalledTimes(1);
  });

  it("should throw an error on invalid filter format", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        filter: ["invalid_filter"],
      },
      sequelizeQueryParser: { model },
    };
    expect(() => buildFilter(req as any, {} as Response, fakeNext)).toThrow(
      parseStringWithParams(INVALID_FILTER, "invalid_filter")
    );
    expect(fakeNext.mock.calls).toHaveLength(0);
  });

  it("should throw an error on invalid model attribute", () => {
    const req: Partial<SequelizeQueryParserRequestInterface> = {
      query: {
        filter: ["firstName.not.david"],
      },
      sequelizeQueryParser: { model },
    };
    expect(() => buildFilter(req as any, {} as Response, fakeNext)).toThrow(
      parseStringWithParams(MODEL_ATTRIBUTE_NOT_FOUND, "firstName", model.name)
    );
    expect(fakeNext.mock.calls).toHaveLength(0);
  });
});
