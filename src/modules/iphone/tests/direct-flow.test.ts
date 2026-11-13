import { describe, expect, test } from "vitest"
import { mergeIphoneFolderAcrossPages } from "#synapse/modules/iphone/internal/module-service"
import {
  IPHONE_HOME_TEST_APP,
  IPHONE_HOME_TEST_EDIT,
  IPHONE_HOME_TEST_FOLDER,
  IPHONE_HOME_TEST_INSIDE,
  IPHONE_HOME_TEST_PAGE,
  IPHONE_HOME_TEST_PAGE_TWO,
} from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

async function confirmsDirectDrop(): Promise<void> {
  const pageTwo = [IPHONE_HOME_TEST_PAGE_TWO, IPHONE_HOME_TEST_FOLDER]
  const insideBefore = [
    IPHONE_HOME_TEST_PAGE,
    IPHONE_HOME_TEST_INSIDE,
    { ...IPHONE_HOME_TEST_APP, name: "Fotos", label: "Fotos" },
  ]
  const folderAfter = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }
  const pageTwoAfter = [IPHONE_HOME_TEST_PAGE_TWO, folderAfter]
  const insideAfter = [...insideBefore, IPHONE_HOME_TEST_APP]
  const port = new IphoneHomeScriptedPort([
    pageTwo,
    insideBefore,
    pageTwo,
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP],
    [{ ...IPHONE_HOME_TEST_PAGE, value: "Página 1 de 3" }, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP],
    [{ ...IPHONE_HOME_TEST_PAGE_TWO, value: "Página 2 de 3" }, IPHONE_HOME_TEST_EDIT, folderAfter],
    pageTwoAfter,
    insideAfter,
    pageTwoAfter,
  ])
  const result = await mergeIphoneFolderAcrossPages(
    port,
    { kind: "merge", source: "Notas", destination: "Trabalho", fromPage: 1, toPage: 2 },
    new AbortController().signal,
  )
  expect(result).toEqual({ kind: "accepted" })
  expect(port.actionsCount).toBe(2)
}

async function refusesChangedFolderContents(): Promise<void> {
  const pageTwo = [IPHONE_HOME_TEST_PAGE_TWO, IPHONE_HOME_TEST_FOLDER]
  const insideBefore = [
    IPHONE_HOME_TEST_PAGE,
    IPHONE_HOME_TEST_INSIDE,
    { ...IPHONE_HOME_TEST_APP, name: "Fotos", label: "Fotos" },
  ]
  const folderAfter = { ...IPHONE_HOME_TEST_FOLDER, value: "2 apps" }
  const pageTwoAfter = [IPHONE_HOME_TEST_PAGE_TWO, folderAfter]
  const insideAfter = [...insideBefore, { ...IPHONE_HOME_TEST_APP, name: "Outro", label: "Outro" }]
  const port = new IphoneHomeScriptedPort([
    pageTwo,
    insideBefore,
    pageTwo,
    [IPHONE_HOME_TEST_PAGE, IPHONE_HOME_TEST_APP],
    [{ ...IPHONE_HOME_TEST_PAGE, value: "Página 1 de 3" }, IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_APP],
    [{ ...IPHONE_HOME_TEST_PAGE_TWO, value: "Página 2 de 3" }, IPHONE_HOME_TEST_EDIT, folderAfter],
    pageTwoAfter,
    insideAfter,
    pageTwoAfter,
  ])
  const result = await mergeIphoneFolderAcrossPages(
    port,
    { kind: "merge", source: "Notas", destination: "Trabalho", fromPage: 1, toPage: 2 },
    new AbortController().signal,
  )
  expect(result.kind).toBe("refused")
  expect(port.actionsCount).toBe(2)
}

async function refusesUnexpectedDrop(): Promise<void> {
  const port = new IphoneHomeScriptedPort([[IPHONE_HOME_TEST_PAGE_TWO]])
  const result = await mergeIphoneFolderAcrossPages(
    port,
    { kind: "merge", source: "Notas", destination: "Ausente", fromPage: 1, toPage: 2 },
    new AbortController().signal,
  )
  expect(result.kind).toBe("refused")
  expect(port.actionsCount).toBe(0)
}

function suite(): void {
  test("confirma queda direta sem repetir gesto", confirmsDirectDrop)
  test("recusa conteúdo divergente sem repetir gesto", refusesChangedFolderContents)
  test("recusa destino ausente antes de gesto", refusesUnexpectedDrop)
}

describe("queda direta entre páginas", suite)
