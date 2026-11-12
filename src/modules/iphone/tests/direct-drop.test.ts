import { describe, expect, test } from "vitest"
import { verifyIphoneDirectFolderDrop } from "#synapse/modules/iphone/internal/module-service"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function confirmsDirectDrop(): Promise<void> {
  const folder = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }
  const existing = { ...IPHONE_HOME_TEST_APP, index: 3, name: "Fotos", label: "Fotos" }
  const screen = [IPHONE_HOME_TEST_PAGE, folder]
  const inside = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_INSIDE, existing, IPHONE_HOME_TEST_APP]
  const port = new IphoneHomeScriptedPort([screen, inside, screen])
  const result = await verifyIphoneDirectFolderDrop(
    port,
    { source: "Notas", destination: "Trabalho", fromPage: 2, toPage: 1 },
    ["Fotos"],
    new AbortController().signal,
  )
  expect(result.kind).toBe("direct-drop")
}

async function refusesLooseIcon(): Promise<void> {
  const screen = [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_FOLDER, IPHONE_HOME_TEST_APP]
  const port = new IphoneHomeScriptedPort([screen])
  const result = await verifyIphoneDirectFolderDrop(
    port,
    { source: "Notas", destination: "Trabalho", fromPage: 2, toPage: 1 },
    ["Fotos"],
    new AbortController().signal,
  )
  expect(result.kind).toBe("refused")
}

function suite(): void {
  test("confirma conteúdo após entrada direta", confirmsDirectDrop)
  test("recusa ícone ainda solto", refusesLooseIcon)
}

describe("entrada direta na pasta", suite)
