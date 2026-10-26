import { describe, expect, it } from "@jest/globals";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
  it.each([
    [0, "00:00"],
    [65.9, "01:05"],
    [3605, "1:00:05"],
    [-1, "00:00"],
    [NaN, "00:00"],
    [Infinity, "00:00"],
  ])("formats %s as %s", (time, expected) => {
    expect(formatTime(time)).toBe(expected);
  });
});
