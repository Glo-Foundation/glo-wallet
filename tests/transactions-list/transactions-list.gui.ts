import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { loginWithMetamask, getBaseURL } from "../utils";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Transactions List", () => {
  test.describe("initial state", () => {
    test("should show 'No transactions to show - please log in' when not authed", async ({
      page,
    }) => {
      await page.goto("/");
      expect(
        await page.isVisible("text=No transactions to show - please log in")
      ).toBeTruthy();
    });
  });

  test.describe("empty state", () => {
    test.beforeEach(async ({ page, gui }) => {
      await loginWithMetamask(page, gui);
    });

    test("it should render 'No transactions yet - buy some Glo?'", async ({
      page,
    }) => {
      expect(
        await page.isVisible("text=No transactions yet - buy some Glo?")
      ).toBeTruthy();
    });
  });
});
