import { describe, expect, test } from "vitest"
import { snapshotIphoneCascade, verifyIphoneCascade } from "#synapse/modules/iphone/internal/home-screen-operations"
import { IPHONE_HOME_TEST_APP, IPHONE_HOME_TEST_PAGE } from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function detectsCascade(): Promise<void> {
  const pageTwo = { ...IPHONE_HOME_TEST_PAGE, value: "Página 2 de 3" }
  const pageThree = { ...IPHONE_HOME_TEST_PAGE, value: "Página 3 de 3" }
  const port = new IphoneHomeScriptedPort([[pageTwo], [pageThree], [pageThree, IPHONE_HOME_TEST_APP]])
  const snapshot = await snapshotIphoneCascade(
    port,
    { name: "Notas", folder: false, from: 1, to: 2 },
    new AbortController().signal,
  )
  const result = await verifyIphoneCascade(port, snapshot, 2, new AbortController().signal)
  expect(result).toMatchObject({ kind: "refused", message: expect.stringContaining("página") })
}

function suite(): void {
  test("recusa cascata na página seguinte", detectsCascade)
}

describe("proteção de cascata", suite)
