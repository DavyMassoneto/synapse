import { describe, expect, test } from "vitest"
import { renameIphoneHomeFolder } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_EXTRA_CLEAR,
  IPHONE_HOME_EXTRA_DELETE,
  IPHONE_HOME_EXTRA_RENAMED,
} from "./home-screen-operations-extra-fixtures"
import {
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function succeeds(): Promise<void> {
  const port = new IphoneHomeScriptedPort([
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER, IPHONE_HOME_TEST_EDIT],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_EXTRA_CLEAR, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_EXTRA_RENAMED, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER],
  ])
  expect((await renameIphoneHomeFolder(port, "Trabalho", "Casa", new AbortController().signal)).kind).toBe("accepted")
}

async function refuses(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT]])
  expect((await renameIphoneHomeFolder(port, "ausente", "Casa", new AbortController().signal)).kind).toBe("refused")
  expect(port.tapsCount).toBe(0)
}

function register(): void {
  test("conclui operação verificada", succeeds)
  test("recusa desvio sem gesto adicional", refuses)
}

describe("operação rename", register)
