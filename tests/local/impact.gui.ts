import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

const EXAMPLE_ADDRESS = "0x81b6b31639314917f73a12cbdc12abd50cd0ed35";

test.use({
  baseURL: "http://localhost:3000",
});

test.describe("Page load", () => {
  test("should load the page", async ({ page, gui }) => {
    await page.goto(`http://localhost:3000/impact/${EXAMPLE_ADDRESS}`);

    expect(page.getByRole("button", { name: "ed35" })).toBeDefined();
  });
});
