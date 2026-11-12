import { describe, expect, test } from "vitest"
import { ComputerStickyWindowTarget } from "../internal"
import { computerTestWindow } from "./support"

function makeSut(): ComputerStickyWindowTarget {
  return new ComputerStickyWindowTarget()
}

function foreground(): void {
  const sut = makeSut()
  sut.select(
    [computerTestWindow("Editor", 1, 1), computerTestWindow("Browser", 2, 2)],
    [],
    { kind: "target-implicit" },
    "darwin",
  )
  const target = sut.current()
  expect(target.kind).toBe("target-selected")
  if (target.kind !== "target-selected") {
    throw new Error("Janela esperada")
  }
  expect(target.window.app).toBe("Browser")
}

function shellIgnored(): void {
  const sut = makeSut()
  sut.select(
    [computerTestWindow("Finder", 1, 10), computerTestWindow("Editor", 2, 1)],
    [],
    { kind: "target-implicit" },
    "darwin",
  )
  expect(sut.inputTarget("Finder").kind).toBe("target-rejected")
}

function windowsShellIgnored(): void {
  const sut = makeSut()
  sut.select(
    [computerTestWindow("Program Manager", 1, 10), computerTestWindow("Editor", 2, 1)],
    [],
    { kind: "target-implicit" },
    "win32",
  )
  expect(sut.inputTarget("Program Manager").kind).toBe("target-rejected")
}

function linuxShellIgnored(): void {
  const sut = makeSut()
  sut.select(
    [computerTestWindow("plasmashell", 1, 10), computerTestWindow("Editor", 2, 1)],
    [],
    { kind: "target-implicit" },
    "linux",
  )
  expect(sut.inputTarget("plasmashell").kind).toBe("target-rejected")
}

function noEligibleWindow(): void {
  const window = computerTestWindow("Editor", 1, 1)
  window.onScreen = false
  expect(makeSut().select([window], [], { kind: "target-implicit" }, "linux").kind).toBe("target-rejected")
}

function selfIgnored(): void {
  expect(
    makeSut().select([computerTestWindow("Cua Driver", 1, 1)], [], { kind: "target-implicit" }, "darwin").kind,
  ).toBe("target-rejected")
}

function exactApp(): void {
  const sut = makeSut()
  sut.select(
    [computerTestWindow("Visual Studio Code", 1, 10), computerTestWindow("Code", 2, 1)],
    [],
    { kind: "target-app", app: "Code" },
    "darwin",
  )
  const target = sut.current()
  if (target.kind === "target-selected") {
    expect(target.window.pid).toBe(2)
  } else {
    expect(target.kind).toBe("target-selected")
  }
}

function appAlias(): void {
  const result = makeSut().select(
    [computerTestWindow("Editor", 1, 1)],
    [{ name: "Editor", pid: 1, aliases: ["com.editor"], running: true }],
    { kind: "target-app", app: "com.editor" },
    "darwin",
  )
  expect(result.kind).toBe("target-selected")
}

function invalidExact(): void {
  expect(makeSut().select([], [], { kind: "target-exact", pid: 0, windowId: 1 }, "linux").kind).toBe("target-rejected")
}

function sticky(): void {
  const sut = makeSut()
  sut.select([computerTestWindow("Editor", 1, 1)], [], { kind: "target-implicit" }, "linux")
  expect(sut.inputTarget("Editor").kind).toBe("target-selected")
  expect(sut.inputTarget("Browser").kind).toBe("target-rejected")
  expect(sut.current().kind).toBe("target-selected")
}

function failureClears(): void {
  const sut = makeSut()
  sut.select([computerTestWindow("Editor", 1, 1)], [], { kind: "target-implicit" }, "linux")
  sut.select([], [], { kind: "target-implicit" }, "linux")
  expect(sut.current().kind).toBe("target-absent")
}

function screenClears(): void {
  const sut = makeSut()
  sut.select([computerTestWindow("Editor", 1, 1)], [], { kind: "target-implicit" }, "linux")
  expect(sut.select([], [], { kind: "target-app", app: "screen" }, "linux").kind).toBe("target-screen")
  expect(sut.current().kind).toBe("target-absent")
}

function isolatedBounds(): void {
  const window = computerTestWindow("Editor", 1, 1)
  const sut = makeSut()
  sut.select([window], [], { kind: "target-implicit" }, "darwin")
  if (window.bounds.kind !== "bounds-known") {
    throw new Error("Limites esperados")
  }
  window.bounds.rectangle.width = 1
  const target = sut.current()
  expect(target.kind).toBe("target-selected")
  if (target.kind !== "target-selected" || target.window.bounds.kind !== "bounds-known") {
    throw new Error("Alvo com limites esperado")
  }
  expect(target.window.bounds.rectangle.width).toBe(200)
}

function exactIdentity(): void {
  const result = makeSut().select([], [], { kind: "target-exact", pid: 10, windowId: 20 }, "linux")
  expect(result).toEqual({ kind: "exact-target-selected", pid: 10, windowId: 20 })
}

function register(): void {
  test("copia limites da janela", isolatedBounds)
  test("alvo exato não fabrica janela", exactIdentity)
  test("escolhe maior ordem Z", foreground)
  test("ignora shell macOS", shellIgnored)
  test("ignora shell Windows", windowsShellIgnored)
  test("ignora shell Linux", linuxShellIgnored)
  test("recusa sem janela elegível", noEligibleWindow)
  test("ignora janela do driver", selfIgnored)
  test("prefere nome exato", exactApp)
  test("resolve alias de aplicativo", appAlias)
  test("recusa alvo exato inválido", invalidExact)
  test("mantém alvo entre entradas", sticky)
  test("falha limpa alvo", failureClears)
  test("tela cheia limpa alvo interativo", screenClears)
}

describe("seleção de janela", register)
