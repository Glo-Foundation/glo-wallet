import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import Transactions from "@/components/Transactions";
import { useUserStore } from "@/lib/store";

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

  test.describe("authed state", () => {
    test.beforeEach(async ({ page, gui }) => {
      await loginWithMetamask(page, gui);
    });

    test("EMPTY STATE - it should render 'No transactions yet - buy some Glo?'", async ({
      page,
    }) => {
      expect(
        await page.isVisible("text=No transactions yet - buy some Glo?")
      ).toBeTruthy();
    });

    test("POPULATED STATE - it should not show transaction list by default", async ({
      page,
    }) => {
      const { setTransfers } = useUserStore();
      await setTransfers({
        transfers: [
          {
            type: "incoming",
            ts: "2023-06-20T12:41:09.000Z",
            from: "0x29fcacc21dd398c3d510ac39ff37de90d36ad38e",
            to: "0x6c08cb13556b4b4ae86fbf7c27b671bdd1a3bcdd",
            value: "344",
            hash: "0xfcc6af447ac2fc1c1c604cff110c642956a44368595ad8ada6822741b6c7eefc",
          },
        ],
      });
      // const transactions = await mount(<Transactions />);
      const txnsList = await transactions.getByTestId("transactions-list");
      expect(txnsList).toBeHidden();
    });
  });
});
