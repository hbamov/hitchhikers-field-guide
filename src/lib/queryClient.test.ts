import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

describe("queryClient", () => {
  it("caches queries for five minutes and retries a failed query once", () => {
    const options = queryClient.getDefaultOptions().queries;
    expect(options?.staleTime).toBe(5 * 60 * 1000);
    expect(options?.retry).toBe(1);
  });
});
