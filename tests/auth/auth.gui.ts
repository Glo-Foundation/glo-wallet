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

    await gui.setBalance(common.gloAddress, "12340000000000000000000");

    await page.getByTestId("tos-checkbox").check();
  });

  test("should allow email sign up", async ({ page, gui }) => {
    const walletConnectButton = await page.isVisible("text=Email");
    if (walletConnectButton) {
      await page.fill(
        "input[data-testid=submit-email-input]",
        "engineering+e2e@glodollar.org"
      );
      await page.getByTestId("submit-email-button").click();
    }

    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });

  test("should allow social login", async ({ page, gui }) => {
    const socialLoginButton = await page.isVisible("text=WalletConnect");
    if (socialLoginButton) {
      await page.getByTestId("social-login-button").click();
    }

    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });

  // Only added
  test.only("should allow metamask login", async ({ page, gui }) => {
    // const metamaskButton = await page.isVisible("text=Metamask");
    // if (metamaskButton) {
    //   await page.getByTestId("metamask-login-button").click();
    // }

    const walletAddress = await gui.getWalletAddress();
    const walletBalance = await gui.getBalance(
      common.gloAddress,
      walletAddress
    );
    expect(walletBalance).toEqual("12340000000000000000000");

    // Seems like plaiwright does not have built-in wait
    // so we need to add conditional waits
    await page.waitForTimeout(1000);

    // Balance is build from multiple components
    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });

  test("should allow wallet connect login", async ({ page, gui }) => {
    const walletConnectButton = await page.isVisible("text=WalletConnect");
    if (walletConnectButton) {
      await page.getByTestId("metamask-login-button").click();
    }

    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });
});
