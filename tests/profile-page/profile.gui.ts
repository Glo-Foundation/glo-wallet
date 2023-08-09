import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { getBaseURL, loginWithMetamask } from "../utils";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Profile", () => {
  test.beforeEach(async ({ page, gui }) => {
    await loginWithMetamask(page, gui);

    await page.getByTestId("profile-button").click();
  });

  test("opens profile with correct data", async ({ page, gui }) => {
    const address = await gui.getWalletAddress();

    const addressField = await page
      .getByTestId("profile-address")
      .textContent();

    expect(addressField).toContain(address.slice(0, 5));

    const networkField = await page
      .getByTestId("profile-network")
      .textContent();

    expect(networkField).toEqual("Polygon (137)");

    // TODO: Test profile field with (if) Sequence connector
    const profileField = page.getByTestId("profile-email");

    expect(await profileField.count()).toEqual(0);

    const qr = page.getByTestId("profile-qr");

    expect(await qr.count()).toEqual(1);
  });

  test("logouts successfully", async ({ page }) => {
    await page.getByTestId("profile-logout").click();

    await page.isVisible("text=Log in");
  });
});
