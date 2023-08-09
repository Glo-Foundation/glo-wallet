import { GUI } from "@guardianui/test/dist/models/GUI";
import { Page } from "@playwright/test";

export const getBaseURL = () => {
  switch (process.env.E2E_ENV) {
    case "production": {
      return "https://app.glodollar.org";
    }
    case "test": {
      return "https://testnet.glodollar.org";
    }
    default: {
      return "http://localhost:3000";
    }
  }
};

export const CONSTANTS = {
  authModalText: "Welcome to the Glo App",
  gloAddress: "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3",
};

export const loginWithMetamask = async (page: Page, gui: GUI) => {
  const POLYGON = 137;
  await gui.initializeChain(POLYGON, 45735806);

  await page.goto("/");

  await gui.setBalance(CONSTANTS.gloAddress, "12340000000000000000000");

  await page.getByTestId("tos-checkbox").check();

  await page.isVisible("text=Metamask");
  await page.getByTestId("metamask-login-button").click();
};
