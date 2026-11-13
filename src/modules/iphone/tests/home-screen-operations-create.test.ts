import { describe, expect, test } from "vitest"
import { createIphoneHomeFolder } from "#synapse/modules/iphone/internal/home-screen-operations"
import {
  IPHONE_HOME_EXTRA_APP,
  IPHONE_HOME_EXTRA_AUTOFOLDER,
  IPHONE_HOME_EXTRA_CLEAR,
  IPHONE_HOME_EXTRA_DELETE,
  IPHONE_HOME_EXTRA_NAMED_FOLDER,
  IPHONE_HOME_EXTRA_RENAMED,
} from "./home-screen-operations-extra-fixtures"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function succeeds(): Promise<void> {
  const icons = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_APP, IPHONE_HOME_TEST_EDIT]
  const auto = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_AUTOFOLDER, IPHONE_HOME_TEST_EDIT]
  const port = new IphoneHomeScriptedPort([
    icons,
    auto,
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_AUTOFOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_APP],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_AUTOFOLDER],
    auto,
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_EXTRA_CLEAR, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_EXTRA_RENAMED, IPHONE_HOME_EXTRA_DELETE],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_NAMED_FOLDER],
    [IPHONE_HOME_TEST_INSIDE, IPHONE_HOME_TEST_APP, IPHONE_HOME_EXTRA_APP],
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_EXTRA_NAMED_FOLDER],
  ])
  expect((await createIphoneHomeFolder(port, "Notas", "Fotos", "Casa", new AbortController().signal)).kind).toBe(
    "accepted",
  )
}

async function refuses(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT]])
  expect((await createIphoneHomeFolder(port, "Notas", "Fotos", "Casa", new AbortController().signal)).kind).toBe(
    "refused",
  )
  expect(port.actionsCount).toBe(0)
}

function register(): void {
  test("conclui operação verificada", succeeds)
  test("recusa desvio sem gesto adicional", refuses)
}

describe("operação create", register)
