import { describe, expect, test } from "vitest"
import {
  editIphoneHomeScreen,
  exitIphoneHomeEdit,
  gotoIphoneHomePage,
} from "#synapse/modules/iphone/internal/home-screen-operations"
import { IphoneHomeOperationsDouble } from "./home-screen-operations-double"

async function entersEdit(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  expect(await editIphoneHomeScreen(port, new AbortController().signal)).toStrictEqual({ kind: "accepted" })
}

async function rejectsFailedEdit(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  port.change = false
  expect((await editIphoneHomeScreen(port, new AbortController().signal)).kind).toBe("refused")
}

async function exitsEdit(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  port.edit = true
  expect(await exitIphoneHomeEdit(port, new AbortController().signal)).toStrictEqual({ kind: "accepted" })
}

async function rejectsUncalibratedViewport(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  port.width = 300
  expect((await exitIphoneHomeEdit(port, new AbortController().signal)).kind).toBe("refused")
}

async function goesToPage(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  expect(await gotoIphoneHomePage(port, 2, new AbortController().signal)).toStrictEqual({ kind: "accepted" })
}

async function stopsWhenPageDoesNotMove(): Promise<void> {
  const port = new IphoneHomeOperationsDouble()
  port.change = false
  expect((await gotoIphoneHomePage(port, 2, new AbortController().signal)).kind).toBe("refused")
}

function registerTests(): void {
  test("vai à página solicitada", goesToPage)
  test("para quando a página não muda", stopsWhenPageDoesNotMove)
  test("entra em edição", entersEdit)
  test("recusa edição que não ocorreu", rejectsFailedEdit)
  test("sai de edição", exitsEdit)
  test("recusa tela não calibrada", rejectsUncalibratedViewport)
}

describe("operações de tela inicial", registerTests)
