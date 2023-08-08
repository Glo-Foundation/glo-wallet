import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { getBaseURL } from "../utils";

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
      const POLYGON = 137;
      await gui.initializeChain(POLYGON, 45735806);
      await page.goto("/");

      const GLO = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";
      await gui.setBalance(GLO, "12340000000000000000000");

      const authPopupVisible = await page.isVisible(
        "text=Welcome to the Glo App"
      );
      if (!authPopupVisible) {
        await page.getByTestId("primary-login-button").click();
      }

      const dialog = await page.waitForSelector("#modal");
      const checkbox = await dialog.$("#tos-checkbox");
      await checkbox.check();
      const socialLoginButton = await dialog.$("#social-login-button");
      await socialLoginButton.click();
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
