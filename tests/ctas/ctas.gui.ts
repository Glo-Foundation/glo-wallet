import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { loginWithMetamask } from "../utils";

test.describe("Help Grow CTAs", () => {
  test.beforeEach(async ({ page, gui }) => {
    await loginWithMetamask(page, gui);
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
      await tweetCTA.click({ force: true });

      await expect(page.getByRole("dialog")).toBeTruthy();
      await expect(
        page.getByRole("button", { name: "1. Tweet your impact" })
      ).toBeTruthy();
      await expect(
        page.getByRole("button", { name: "2. Verify Tweet" })
      ).toBeTruthy();
    });

    test("should open get started page", async ({ page, context }) => {
      const pagePromise = context.waitForEvent("page");
      const joinMovementCTA = await page.locator(
        '[href="https://www.glodollar.org/get-started?email="]'
      );

      await joinMovementCTA.click({ force: true });
      const newPage = await pagePromise;

      await newPage.waitForLoadState();
      await expect(newPage).toHaveTitle("Join Glo as an Early Adopter");
    });

    test("should open merch page", async ({ page, context }) => {
      const pagePromise = context.waitForEvent("page");
      const merchMovementCTA = await page.locator(
        '[href="https://merch.glodollar.org"]'
      );

      await merchMovementCTA.click({ force: true });
      const newPage = await pagePromise;

      await newPage.waitForLoadState();
      await expect(newPage).toHaveTitle(
        "Glo merch – Glo Development Foundation, Inc."
      );
    });
  });
});
