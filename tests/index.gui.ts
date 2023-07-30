import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

test.use({
  baseURL: "http://localhost:3000",
});
test.beforeEach(async ({ page, gui }) => {
  // Initialize Mumbai
  await gui.initializeChain(80001);
  // Set ETH balance to 1 for the test wallet
  await gui.setEthBalance("1000000000000000000");
});

test.describe("Page load", () => {
  test("should load the page", async ({ page, gui }) => {
    await page.goto("https://guardianui.com");
    expect(page).toContain("Balance");
  });
});
