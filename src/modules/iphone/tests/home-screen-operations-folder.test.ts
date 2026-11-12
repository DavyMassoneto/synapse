import { describe, expect, test } from "vitest"
import { readIphoneHomeFolder } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function readsFolder(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
  ])
  expect(await readIphoneHomeFolder(port, "Trabalho", new AbortController().signal)).toStrictEqual({
    kind: "accepted",
    names: ["Notas"],
  })
}

async function rejectsMissingFolder(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE]])
  expect((await readIphoneHomeFolder(port, "Trabalho", new AbortController().signal)).kind).toBe("refused")
  expect(port.tapsCount).toBe(0)
}

async function readsMultipleFolderPages(): Promise<void> {
  const folder = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }
  const app = { ...IPHONE_HOME_TEST_APP, name: "Fotos", label: "Fotos" }
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, folder],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE_TWO, app],
    [IPHONE_HOME_TEST_PAGE, folder],
  ])
  expect(await readIphoneHomeFolder(port, "Trabalho", new AbortController().signal)).toStrictEqual({
    kind: "accepted",
    names: ["Fotos", "Notas"],
  })
}

function registerTests(): void {
  test("lê e fecha a pasta", readsFolder)
  test("lê todas as páginas da pasta", readsMultipleFolderPages)
  test("recusa pasta ausente sem tocar", rejectsMissingFolder)
}

describe("leitura de pasta", registerTests)
