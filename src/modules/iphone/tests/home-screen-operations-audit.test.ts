import { describe, expect, test } from "vitest"
import { auditIphoneHomeScreen } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function auditsPages(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP], [IPHONE_HOME_TEST_PAGE_TWO]])
  const result = await auditIphoneHomeScreen(port, new AbortController().signal)
  expect(result).toStrictEqual({
    kind: "accepted",
    pages: [
      { page: 1, apps: ["Notas"], folders: [], widgets: false },
      { page: 2, apps: [], folders: [], widgets: false },
    ],
  })
}

async function rejectsMissingPageIndicator(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_APP]])
  expect((await auditIphoneHomeScreen(port, new AbortController().signal)).kind).toBe("refused")
  expect(port.swipesCount).toBe(0)
}

function registerTests(): void {
  test("audita todas as páginas", auditsPages)
  test("para sem indicador de página", rejectsMissingPageIndicator)
}

describe("auditoria de tela inicial", registerTests)
