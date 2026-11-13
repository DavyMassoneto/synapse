import { describe, expect, test } from "vitest"
import { hopIphoneHomeIcon } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function hopsOnePage(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_PAGE_TWO],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_PAGE_TWO, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP],
  ])
  expect(
    (await hopIphoneHomeIcon(port, { name: "Notas", folder: false, from: 1, to: 2 }, new AbortController().signal))
      .kind,
  ).toBe("accepted")
}

async function refusesNonAdjacentPage(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE]])
  expect(
    (await hopIphoneHomeIcon(port, { name: "Notas", folder: false, from: 1, to: 3 }, new AbortController().signal))
      .kind,
  ).toBe("refused")
  expect(port.swipesCount).toBe(0)
}

function registerTests(): void {
  test("move para a página adjacente", hopsOnePage)
  test("recusa salto de mais de uma página", refusesNonAdjacentPage)
}

describe("movimento entre páginas", registerTests)
