import { parseStringWithParams } from "../src/utils";
describe("Utilities functions", () => {
  it("must parse a string with params", () => {
    const target = "A simple {1} to parse";
    const parsed = parseStringWithParams(target, "string");
    expect(parsed).toEqual("A simple string to parse");
  });
});
