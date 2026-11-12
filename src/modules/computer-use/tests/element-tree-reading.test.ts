import { describe, expect, test } from "vitest"
import { computerReadElementTree } from "../internal"

function numberedTree(): void {
  const tree = computerReadElementTree(
    '3 elements\nAXWindow "Documento"\n- [1] AXButton "Salvar"\n [2] AXTextField = "Nome"\n [3] AXButton (Enviar)',
    "macos-ax",
  )
  expect(tree.kind).toBe("tree-read")
  if (tree.kind !== "tree-read") {
    throw new Error("Árvore esperada")
  }
  expect(tree.elements.map((element) => element.label)).toEqual(["Salvar", "Nome", "Enviar"])
  expect(tree.windowTitle).toEqual({ kind: "title-present", title: "Documento" })
}

function labelIdentifier(): void {
  const result = computerReadElementTree("[1] AXButton id=save", "macos-ax")
  expect(result.kind).toBe("tree-read")
  if (result.kind !== "tree-read") {
    throw new Error("Árvore esperada")
  }
  expect(result.elements[0]?.label).toBe("save")
}

function malformed(): void {
  expect(computerReadElementTree("[x] AXButton\n[0] AXButton\n[3]", "macos-ax")).toMatchObject({
    kind: "tree-read",
    elements: [],
  })
}

function empty(): void {
  expect(computerReadElementTree("", "macos-ax")).toEqual({
    kind: "tree-read",
    elements: [],
    windowTitle: { kind: "title-absent" },
  })
}

function unsupported(): void {
  expect(computerReadElementTree("", "uia").kind).toBe("tree-unsupported")
}

function register(): void {
  test("recusa formato não suportado", unsupported)
  test("lê elementos e título AX", numberedTree)
  test("usa identificador sem rótulo", labelIdentifier)
  test("ignora linhas malformadas", malformed)
  test("explicita árvore vazia", empty)
}

describe("leitura de árvore AX", register)
