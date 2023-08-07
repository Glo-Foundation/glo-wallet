import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { getBaseURL } from "../utils";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Auth", () => {
  test.beforeEach(async ({ page, gui }) => {
    const POLYGON = 137;
    await gui.initializeChain(POLYGON, 45735806);
    await page.goto("/");

    const address = await gui.getWalletAddress();

    const GLO = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";
    await gui.setBalance(GLO, "1234000000000000000000");

    // What's that? @eric
    // const authPopupVisible = await page.isVisible(
    //   "text=Thanks for being part of the Glo movement"
    // );
    // if (!authPopupVisible) {
    //   await page.getByTestId("primary-login-button").click();
    // }

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
    const walletConnectButton = await page.isVisible("text=WalletConnect");
    if (walletConnectButton) {
      await page.getByTestId("social-login-button").click();
    }

    expect(await page.isVisible("text=$1,234.00")).toBeTruthy();
  });

  // Only added
  test.only("should allow metamask login", async ({ page, gui }) => {
    const metamaskButton = await page.isVisible("text=Metamask");
    if (metamaskButton) {
      await page.getByTestId("metamask-login-button").click();
    }

    // Seems like plaiwright does not have built-in wait
    // so we need to add conditional waits
    await page.waitForTimeout(1000);

    // Balance is build from multiple components
    expect(await page.isVisible("text=1,234")).toBeTruthy();
  });

  test("should allow wallet connect login", async ({ page, gui }) => {
    const walletConnectButton = await page.isVisible("text=WalletConnect");
    if (walletConnectButton) {
      await page.getByTestId("metamask-login-button").click();
    }

    expect(await page.isVisible("text=$1,234.00")).toBeTruthy();
  });
});
