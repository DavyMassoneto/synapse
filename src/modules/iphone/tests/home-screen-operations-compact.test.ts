import { describe, expect, test } from "vitest"
import { compactIphoneHomePage } from "#synapse/modules/iphone/internal/home-screen-operations"
import { IPHONE_HOME_TEST_APP, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_PAGE } from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function acceptsCompactedPage(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP]])
  expect((await compactIphoneHomePage(port, 1, new AbortController().signal)).kind).toBe("accepted")
}

async function movesLastIconIntoGap(): Promise<void> {
  const app = { ...IPHONE_HOME_TEST_APP, rect: { ...IPHONE_HOME_TEST_APP.rect, x: 136 } }
  const before = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT, app]
  const after = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP]
  const port = new IphoneHomeScriptedPort([before, after])
  expect((await compactIphoneHomePage(port, 1, new AbortController().signal)).kind).toBe("accepted")
  expect(port.actionsCount).toBe(1)
}

async function stopsAtUnexpectedMove(): Promise<void> {
  const app = { ...IPHONE_HOME_TEST_APP, rect: { ...IPHONE_HOME_TEST_APP.rect, x: 136 } }
  const state = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_EDIT, app]
  const port = new IphoneHomeScriptedPort([state, state])
  expect((await compactIphoneHomePage(port, 1, new AbortController().signal)).kind).toBe("refused")
  expect(port.actionsCount).toBe(1)
}

function registerTests(): void {
  test("aceita página sem lacunas", acceptsCompactedPage)
  test("move último ícone para lacuna", movesLastIconIntoGap)
  test("para quando movimento não ocorreu", stopsAtUnexpectedMove)
}

describe("compactação", registerTests)
