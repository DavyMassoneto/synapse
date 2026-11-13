import { describe, expect, test } from "vitest"
import { extractIphoneHomeApp } from "#synapse/modules/iphone/internal/home-screen-operations"
import { IPHONE_HOME_EXTRA_DELETE } from "./home-screen-operations-extra-fixtures"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function succeeds(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP, IPHONE_HOME_TEST_EDIT],
  ])
  expect((await extractIphoneHomeApp(port, "Trabalho", "Notas", new AbortController().signal)).kind).toBe("accepted")
}

async function refuses(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE]])
  expect((await extractIphoneHomeApp(port, "ausente", "Notas", new AbortController().signal)).kind).toBe("refused")
  expect(port.tapsCount).toBe(0)
}

async function rejectsUnchangedFolderPage(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE],
  ])
  expect((await extractIphoneHomeApp(port, "Trabalho", "Notas", new AbortController().signal)).kind).toBe("refused")
  expect(port.swipesCount).toBe(1)
  expect(port.actionsCount).toBe(0)
}

async function findsNextFolderPage(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE_TWO, IPHONE_HOME_TEST_APP],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_PAGE_TWO, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP, IPHONE_HOME_TEST_EDIT],
  ])
  expect((await extractIphoneHomeApp(port, "Trabalho", "Notas", new AbortController().signal)).kind).toBe("accepted")
  expect(port.swipesCount).toBe(1)
}

function register(): void {
  test("localiza app na página seguinte", findsNextFolderPage)
  test("para quando a página da pasta não muda", rejectsUnchangedFolderPage)
  test("conclui operação verificada", succeeds)
  test("recusa desvio sem gesto adicional", refuses)
}

describe("operação extract", register)
