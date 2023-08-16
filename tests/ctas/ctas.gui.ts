import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { loginWithMetamask } from "../utils";

test.describe("Help Grow CTAs", () => {
  test.beforeEach(async ({ page, gui }) => {
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

  test.describe("link navs", () => {
    test("should open tweet modal on click", async ({ page }) => {
      const tweetCTA = await page.locator(".cta").first();
      console.log({ tweetCTA });
      await tweetCTA.click({ force: true });

      await expect(page.getByRole("dialog")).toBeTruthy();
      await expect(
        page.getByRole("button", { name: "1. Tweet your impact" })
      ).toBeTruthy();
      await expect(
        page.getByRole("button", { name: "2. Verify Tweet" })
      ).toBeTruthy();
    });
  });
});
