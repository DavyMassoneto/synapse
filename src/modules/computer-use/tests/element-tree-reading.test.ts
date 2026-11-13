import { describe, expect, test } from "vitest"
import { computerReadElementTree } from "../internal"

function numberedTree(): void {
  const tree = computerReadElementTree(
    '3 elements\nAXWindow "Documento"\n- [1] AXButton "Salvar"\n [2] AXTextField = "Nome"\n [3] AXButton (Enviar)',
  )
  expect(tree.kind).toBe("tree-read")
  expect(tree.elements.map((element) => element.label)).toEqual(["Salvar", "Nome", "Enviar"])
  expect(tree.windowTitle).toEqual({ kind: "title-present", title: "Documento" })
}

function labelIdentifier(): void {
  const result = computerReadElementTree("[1] AXButton id=save")
  expect(result.kind).toBe("tree-read")
  expect(result.elements[0]?.label).toBe("save")
}

function malformed(): void {
  expect(computerReadElementTree("[x] AXButton\n[0] AXButton\n[3]")).toMatchObject({
    kind: "tree-read",
    elements: [],
  })
}

function empty(): void {
  expect(computerReadElementTree("")).toEqual({
    kind: "tree-read",
    elements: [],
    windowTitle: { kind: "title-absent" },
  })
}

function register(): void {
  test("lê elementos e título AX", numberedTree)
  test("usa identificador sem rótulo", labelIdentifier)
  test("ignora linhas malformadas", malformed)
  test("explicita árvore vazia", empty)
}

describe("leitura de árvore AX", register)
