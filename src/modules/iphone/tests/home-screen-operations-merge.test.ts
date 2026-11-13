import { describe, expect, test } from "vitest"
import { mergeIphoneHomeFolder } from "#synapse/modules/iphone/internal/home-screen-operations"
import { IPHONE_HOME_EXTRA_APP, IPHONE_HOME_EXTRA_FOLDER } from "./home-screen-operations-extra-fixtures"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function succeeds(): Promise<void> {
  const home = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER, IPHONE_HOME_EXTRA_APP]
  const editing = [...home, IPHONE_HOME_TEST_EDIT]
  const port = new IphoneHomeScriptedPort([
    home,
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP],
    home,
    editing,
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_FOLDER, IPHONE_HOME_TEST_EDIT],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_APP],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_FOLDER],
  ])
  expect((await mergeIphoneHomeFolder(port, "Fotos", "Trabalho", new AbortController().signal)).kind).toBe("accepted")
}

async function refuses(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE]])
  expect((await mergeIphoneHomeFolder(port, "Fotos", "ausente", new AbortController().signal)).kind).toBe("refused")
  expect(port.tapsCount).toBe(0)
}

function register(): void {
  test("conclui operação verificada", succeeds)
  test("recusa desvio sem gesto adicional", refuses)
}

describe("operação merge", register)
