import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { CONSTANTS, getBaseURL } from "../utils";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Auth", () => {
  test.beforeEach(async ({ page, gui }) => {
    const POLYGON = 137;
    await gui.initializeChain(POLYGON, 45735806);
    await page.goto("/");

    await gui.setBalance(CONSTANTS.gloAddress, "12340000000000000000000");

    await page.getByTestId("tos-checkbox").check();
  });

  test.skip("should allow email sign up", async ({ page, gui }) => {
    await page.isVisible("text=Email");
    await page.fill(
      "input[data-testid=submit-email-input]",
      "engineering+e2e@glodollar.org"
    );
    await page.getByTestId("submit-email-button").click();

    await page.waitForTimeout(1000);
    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });

  // Note that can be easily blocked by captcha defence
  test("should allow social login with Discord", async ({ page, gui }) => {
    await page.isVisible("text=Email");
    await page.getByTestId("social-login-button").click();

    const popup = await page.waitForEvent("popup");

    await popup.getByText("Show More Options").click();

    await popup.getByText("Discord").click();

    const discordPopup = await popup.waitForEvent("popup");

    await discordPopup.fill(
      "input[name=email]",
      "engineering+e2e@glodollar.org"
    );

    await discordPopup.fill(
      "input[name=password]",
      process.env.DISCORD_E2E_PW!
    );

    await discordPopup.getByText("Log In").first().click();

    await discordPopup.getByRole("button", { name: "Authorize" }).click();

    expect(await page.isVisible("text=0.00")).toBeTruthy();
  });

  test("should allow metamask login", async ({ page, gui }) => {
    await page.isVisible("text=Metamask");
    await page.getByTestId("metamask-login-button").click();

    const walletAddress = await gui.getWalletAddress();
    const walletBalance = await gui.getBalance(
      CONSTANTS.gloAddress,
      walletAddress
    );
    expect(walletBalance).toEqual("12340000000000000000000");

    await page.waitForTimeout(1000);
    expect(await page.isVisible("text=12,340.00")).toBeTruthy();
  });

  test("should allow wallet connect login", async ({ page, gui }) => {
    await page.isVisible("text=WalletConnect");
    await page.getByTestId("walletconnect-login-button").click();

    const copy = await page.waitForSelector(".wcm-action-btn");
    expect(await page.isVisible("text=Scan with your wallet")).toBeTruthy();

    await copy.click();

    // We could open our app in new page login with Sequence
    // and use scan to fully test the WC flow
  });
});
