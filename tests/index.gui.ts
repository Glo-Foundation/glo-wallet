import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

// test.use({
//   baseURL: "http://localhost:3000",
// });

test.describe("Page load", () => {
  test("should have balance of 1 ETH", async ({ page, gui }) => {
    await page.goto("/");
    // const result = await page.evaluate((w) => {
    //   return Promise.resolve((w as any).ethereum);
    // }, window);
    await gui.initializeChain(137, 45735806);
    await gui.setEthBalance("1000000000000000000");
    // await gui.setBalance("0x4F604735c1cF31399C6E711D5962b2B3E0225AD3", "10000000000000000000");

    // const testWallet = await gui.getWalletAddress();
    // const testWalletEthBalance = await gui.getEthBalance(testWallet);
    // const testWalletGloBalance = await gui.getBalance("0x4F604735c1cF31399C6E711D5962b2B3E0225AD3", testWallet);

    // expect(testWalletEthBalance).toEqual("1000000000000000000");
    // expect(testWalletGloBalance).toEqual("10000000000000000000");
  });
});
