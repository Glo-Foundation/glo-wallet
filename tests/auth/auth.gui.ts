import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { common, getBaseURL } from "../utils";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Auth", () => {
  test.beforeEach(async ({ page, gui }) => {
    const POLYGON = 137;
    await gui.initializeChain(POLYGON, 45735806);
    await page.goto("/");

    const GLO = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";
    await gui.setBalance(GLO, "12340000000000000000000");

    const authPopupVisible = await page.isVisible(
      `text=${common.authModalText}`
    );
    if (!authPopupVisible) {
      await page.getByTestId("primary-login-button").click();
    }

    await page.getByTestId("tos-checkbox").check();
  });

  test("should allow email sign up", async ({ page, gui }) => {
    const walletConnectButton = await page.isVisible("text=Email");
    if (walletConnectButton) {
      await page.fill(
        "input[data-testid=submit-email-input]",
        "engineering.e2e@glodollar.org"
      );
      await page.getByTestId("submit-email-button").click();
    }

    expect(await page.isVisible("text=1,234.00")).toBeTruthy();
  });

  test("should allow social login", async ({ page, gui }) => {
    const socialLoginButton = await page.isVisible("text=WalletConnect");
    if (socialLoginButton) {
      await page.getByTestId("social-login-button").click();
    }

    expect(await page.isVisible("text=$1,234.00")).toBeTruthy();
  });

  test("should allow metamask login", async ({ page, gui }) => {
    const metamaskButton = await page.isVisible("text=Metamask");
    if (metamaskButton) {
      await page.getByTestId("metamask-login-button").click();
    }

    // expect(await page.isVisible("text=$1,234.00")).toBeTruthy();
  });

  test("should allow wallet connect login", async ({ page, gui }) => {
    const walletConnectButton = await page.isVisible("text=WalletConnect");
    if (walletConnectButton) {
      await page.getByTestId("metamask-login-button").click();
    }

    expect(await page.isVisible("text=$1,234.00")).toBeTruthy();
  });
});
