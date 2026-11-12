import { describe, expect, test } from "vitest"
import { hopIphoneHomeIcon, readIphoneHomeFolder } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function stopsWhenFolderPageDoesNotAdvance(): Promise<void> {
  const folder = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }
  const inside = [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP]
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE, folder], inside, inside])
  expect((await readIphoneHomeFolder(port, "Trabalho", new AbortController().signal)).kind).toBe("refused")
  expect(port.swipesCount).toBe(1)
}

async function rejectsBlockedHop(): Promise<void> {
  const widget = {
    ...IPHONE_HOME_TEST_APP,
    name: "widget",
    label: "widget",
    value: "Widget",
    rect: { x: 120, y: 90, width: 100, height: 80 },
  }
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP, widget],
    [IPHONE_HOME_TEST_PAGE_TWO],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP, widget],
    [
      IPHONE_HOME_TEST_PAGE,
      IPHONE_HOME_TEST_APP,
      widget,
      {
        index: 4,
        type: "Button",
        name: "OK",
        label: "OK",
        value: "",
        rect: { x: 350, y: 20, width: 40, height: 30 },
        enabled: true,
        interactive: true,
      },
    ],
  ])
  expect(
    (await hopIphoneHomeIcon(port, { name: "Notas", folder: false, from: 1, to: 2 }, new AbortController().signal))
      .kind,
  ).toBe("refused")
  expect(port.actionsCount).toBe(1)
}

function registerTests(): void {
  test("para quando a página interna não avança", stopsWhenFolderPageDoesNotAdvance)
  test("recusa arrasto cujo caminho contém widget", rejectsBlockedHop)
}

describe("desvios da tela inicial", registerTests)
