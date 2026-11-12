import { describe, expect, test } from "vitest"
import { translateIphoneAction, translateIphoneHome } from "#synapse/integration"

function translatesRead(): void {
  expect(translateIphoneHome({ action: "homescreen", op: "read", page: 3 })).toEqual({ kind: "read", page: 3 })
}

function translatesFolder(): void {
  expect(translateIphoneHome({ action: "homescreen", op: "folder", name: "Apps", page: 2 })).toEqual({
    kind: "folder",
    name: "Apps",
    page: 2,
  })
}

function translatesMerge(): void {
  expect(
    translateIphoneHome({ action: "homescreen", op: "merge", name: "App", into: "Apps", from_page: 2, to_page: 3 }),
  ).toEqual({ kind: "merge", source: "App", destination: "Apps", fromPage: 2, toPage: 3 })
}

function rejectsUnknown(): void {
  expect(translateUnknown).toThrow("Argumentos inválidos")
}

function translateUnknown(): void {
  translateIphoneHome({ action: "homescreen", op: "invalid" })
}

function translatesEdgeRelease(): void {
  expect(translateIphoneAction({ action: "drag", x: 10, y: 20, flips: 1, edge: "left" })).toMatchObject({
    kind: "page_drag",
    releaseAtEdge: true,
    flips: 1,
  })
}

function rejectsMissingPage(): void {
  expect(translateMissingPage).toThrow("Argumentos inválidos")
}

function translateMissingPage(): void {
  translateIphoneHome({ action: "homescreen", op: "goto" })
}

function suite(): void {
  test("goto exige página como na extensão original", rejectsMissingPage)
  test("arrasto sem destino libera na borda", translatesEdgeRelease)
  test("traduz página da leitura", translatesRead)
  test("traduz página da pasta", translatesFolder)
  test("traduz páginas da mesclagem", translatesMerge)
  test("recusa operação desconhecida", rejectsUnknown)
}

describe("argumentos da tela inicial iPhone", suite)
