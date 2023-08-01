// import { test } from "@guardianui/test";
// import { expect } from "@playwright/test";

// import { getBaseURL } from "./utils";

// test.use({
// baseURL: getBaseURL(),
// });

// test.describe("Page load", () => {
//   test("should be able to load balance of 1 ETH and 10 GLO to test wallet", async ({ page, gui }) => {
//     const POLYGON = 137;
//     await gui.initializeChain(POLYGON, 45735806);
//     await page.goto("/");
//     await expect(page).toHaveTitle("Glo Dollar App");

//     await gui.setEthBalance("1000000000000000000");
//     await gui.setBalance("0x4F604735c1cF31399C6E711D5962b2B3E0225AD3", "10000000000000000000");

//     const testWallet = await gui.getWalletAddress();
//     console.log("testWallet", testWallet);

//     const testWalletEthBalance = await gui.getEthBalance(testWallet);
//     expect(testWalletEthBalance).toEqual("1000000000000000000");

//     const testWalletGloBalance = await gui.getBalance("0x4F604735c1cF31399C6E711D5962b2B3E0225AD3", testWallet);
//     expect(testWalletGloBalance).toEqual("10000000000000000000");
//   });
// });
