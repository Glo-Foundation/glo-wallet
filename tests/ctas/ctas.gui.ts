import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { loginWithMetamask } from "../utils";

test.describe("Help Grow CTAs", () => {
  test.describe("initial state", () => {
    test("should have 3 appropriate call to actions", async ({ page }) => {
      expect(
        await page.locator("text=Tweet your impact").isVisible()
      ).toBeTruthy();
      expect(await page.locator("text=Join the movement")).toBeTruthy();
      expect(await page.locator("text=Buy Gljfaksle; Merch")).toBeTruthy();
    });
  });
});
