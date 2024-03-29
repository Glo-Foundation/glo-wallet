import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { getBaseURL } from "../utils";

const EXAMPLE_ADDRESS = "0x81b6b31639314917f73a12cbdc12abd50cd0ed35";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Impact page", () => {
  test.beforeEach(async ({ page, gui }) => {
    const POLYGON = 137;
    await gui.initializeChain(POLYGON, 45735806);
    await page.goto(`/impact/${EXAMPLE_ADDRESS}`);
  });

  test("should return example address's Glo impact", async ({ page, gui }) => {
    // Owns Glo
    await page.waitForSelector("data-testid=formatted-balance");
    expect(await page.getByTestId("formatted-balance")).toHaveText("$61,500");

    // Creating basic income of
    await page.waitForLoadState("networkidle");
    const yearlyYield = (
      await page.getByTestId("yearlyYieldFormatted").allTextContents()
    )[0];
    expect(yearlyYield).toEqual("$0 - $1476/ year");

    // Number of people lifted out of poverty
    await page.waitForSelector("data-testid=number-persons-out-poverty");
    expect(
      await page.getByTestId("number-persons-out-poverty").innerText()
    ).toEqual("3");
  });

  test("should simulate lifting people out of poverty", async ({
    page,
    gui,
  }) => {
    // click on simulateBuyGlo
    await page.waitForSelector("data-testid=simulateBuyGlo");
    await page.getByTestId("simulateBuyGlo").click();

    // fill gloInput with 123456
    await page.fill("input[id=gloInput]", "123456");

    // expect basic income to be $0 - $2963/ year
    await page.waitForSelector("data-testid=basic-income-created");
    const basicIncomeCreated = (
      await page.getByTestId("basic-income-created").allInnerTexts()
    )[0];
    expect(basicIncomeCreated).toEqual("$0-$2,963");

    // expect number of people lifted out of poverty to be 6
    await page.waitForSelector("data-testid=number-persons-out-poverty");
    const personsOutPovertyTexts = await page
      .getByTestId("number-persons-out-poverty")
      .allInnerTexts();
    // take the last element of the array
    const numPersonOutPoverty =
      personsOutPovertyTexts.length > 0
        ? personsOutPovertyTexts[personsOutPovertyTexts.length - 1]
        : personsOutPovertyTexts;
    expect(numPersonOutPoverty).toEqual("6");
  });
});
