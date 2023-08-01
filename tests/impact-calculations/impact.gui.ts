import { test } from "@guardianui/test";
import { expect } from "@playwright/test";

import { getBaseURL } from "../utils";

const EXAMPLE_ADDRESS = "0x81b6b31639314917f73a12cbdc12abd50cd0ed35";

test.use({
  baseURL: getBaseURL(),
});

test.describe("Impact page", () => {
  test("should return example address's Glo impact", async ({ page, gui }) => {
    await page.goto(`/impact/${EXAMPLE_ADDRESS}`);

    // Owns Glo
    expect(await page.isVisible("text=$61,500")).toBeTruthy();

    // Creating basic income of
    expect(await page.isVisible("text=$0 - $1,476")).toBeTruthy();
    expect(await page.getByTestId("basic-income-created").innerText()).toEqual(
      "$1,476"
    );

    // Number of people lifted out of poverty
    expect(
      await page.getByTestId("number-persons-out-poverty").innerText()
    ).toEqual("3");
  });
});
