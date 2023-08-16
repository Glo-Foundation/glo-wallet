import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { loginWithMetamask } from "../utils";

test.describe("Help Grow CTAs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.describe("initial state", () => {
    test("should have 3 appropriate call to actions", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "Tweet your impact" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Join the movement" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Buy Glo Dollar Merch" })
      ).toBeVisible();
    });
  });
});
