import { describe, expect, test } from "vitest"
import { findIphoneElement, parseIphoneElementTree } from "#synapse/modules/iphone/internal/element-tree"
import { hopIphoneHomeIcon } from "#synapse/modules/iphone/internal/home-screen-operations"
import { copyIphoneElement, IphoneModuleService } from "#synapse/modules/iphone/internal/module-service"
import { IPHONE_DATA_DEPENDENCIES, IPHONE_DATA_XML } from "./data-constants"
import { DataInfrastructure } from "./data-infrastructure"
import { IPHONE_HOME_TEST_EDIT, IPHONE_HOME_TEST_PAGE } from "./home-screen-operations-fixtures"
import { IphoneHomeScriptedPort } from "./home-screen-operations-scripted"

function copiesRectangle(): void {
  const original = { ...IPHONE_HOME_TEST_EDIT, rect: { ...IPHONE_HOME_TEST_EDIT.rect } }
  const copy = copyIphoneElement(original)
  original.rect.x = 1
  expect(copy.rect.x).toBe(350)
}

async function returnedTreeCannotChangeTarget(): Promise<void> {
  const infrastructure = new DataInfrastructure()
  infrastructure.session.sourceText = IPHONE_DATA_XML
  const service = new IphoneModuleService(IPHONE_DATA_DEPENDENCIES, infrastructure)
  const tree = await service.execute({ kind: "tree", max: 20 }, new AbortController().signal)
  expect(tree.kind).toBe("tree")
  if (tree.kind === "tree") {
    const first = tree.elements[0]
    if (first) {
      first.rect.x = 999
    }
    tree.elements.splice(0)
  }
  await service.executeTargeted(
    { action: { kind: "tap", point: { x: 0, y: 0 } }, target: { kind: "element", index: 1 } },
    new AbortController().signal,
  )
  expect(infrastructure.session.pointerActions[0]).toMatchObject({ x: 6, y: 12 })
  await service.shutdown()
}

async function stopsAfterMissingSource(): Promise<void> {
  const pageTwo = { ...IPHONE_HOME_TEST_PAGE, value: "Página 2 de 3" }
  const pageThree = { ...IPHONE_HOME_TEST_PAGE, value: "Página 3 de 3" }
  const pageOne = { ...IPHONE_HOME_TEST_PAGE, value: "Página 1 de 3" }
  const port = new IphoneHomeScriptedPort([
    [pageTwo],
    [pageThree],
    [pageTwo],
    [pageOne],
    [pageOne, IPHONE_HOME_TEST_EDIT],
  ])
  const result = await hopIphoneHomeIcon(
    port,
    { name: "ausente", folder: false, from: 1, to: 2 },
    new AbortController().signal,
  )
  expect(result.kind).toBe("refused")
  expect(port.swipesCount).toBe(3)
  expect(port.actionsCount).toBe(1)
}

function parsesSingleQuotesAndNumericEntities(): void {
  const result = parseIphoneElementTree(
    "<root><XCUIElementTypeButton label='A&#xE7;&#227;o' x='1' y='2' width='10' height='20'/></root>",
    20,
  )
  expect(result.kind).toBe("accepted")
  if (result.kind === "accepted") {
    expect(findIphoneElement(result.tree.elements, "Ação").kind).toBe("found")
  }
}

function rejectsInvalidNumericEntity(): void {
  expect(parseIphoneElementTree("<root label='&#xD800;'/>", 20).kind).toBe("refused")
}

function parsesSpacedAttributes(): void {
  const result = parseIphoneElementTree(
    '<root><XCUIElementTypeButton label = "Abrir" x = "1" y = "2" width = "10" height = "20"/></root>',
    20,
  )
  expect(result.kind).toBe("accepted")
  if (result.kind === "accepted") {
    expect(result.tree.elements).toMatchObject([{ label: "Abrir", rect: { x: 1, y: 2, width: 10, height: 20 } }])
  }
}

function acceptsDottedAttribute(): void {
  const result = parseIphoneElementTree(
    '<root><XCUIElementTypeButton a.b="1" label="Abrir" x="1" y="2" width="10" height="20"/></root>',
    20,
  )
  expect(result.kind).toBe("accepted")
  if (result.kind === "accepted") {
    expect(result.tree.elements).toHaveLength(1)
  }
}

function rejectsDottedDuplicates(): void {
  expect(parseIphoneElementTree(`<root a.b = "1" a.b = '2'/>`, 20).kind).toBe("refused")
}

function rejectsSpacedDuplicates(): void {
  expect(parseIphoneElementTree('<root a = "1" a = "2"/>', 20).kind).toBe("refused")
}

function ignoresAttributeLikeText(): void {
  expect(parseIphoneElementTree('<root> a="1" a="2" </root>', 20).kind).toBe("accepted")
}

function rejectsDuplicateAttributes(): void {
  expect(parseIphoneElementTree("<root a='1' a=\"2\"/>", 20).kind).toBe("refused")
}

function acceptsGreaterThanInAttribute(): void {
  const result = parseIphoneElementTree(
    "<root><XCUIElementTypeButton label='A > B' x='1' y='2' width='10' height='20'/></root>",
    20,
  )
  expect(result.kind).toBe("accepted")
  if (result.kind === "accepted") {
    expect(findIphoneElement(result.tree.elements, "A > B").kind).toBe("found")
  }
}

function rejectsMalformedAttribute(): void {
  expect(parseIphoneElementTree("<root label='ab/>", 20).kind).toBe("refused")
}

function suite(): void {
  test("árvore devolvida não altera alvo interno", returnedTreeCannotChangeTarget)
  test("isola retângulo devolvido", copiesRectangle)
  test("não navega após recusa", stopsAfterMissingSource)
  test("lê aspas simples e entidades", parsesSingleQuotesAndNumericEntities)
  test("recusa entidade inválida", rejectsInvalidNumericEntity)
  test("lê atributos com espaços", parsesSpacedAttributes)
  test("aceita atributo com ponto", acceptsDottedAttribute)
  test("recusa duplicados com ponto e aspas distintas", rejectsDottedDuplicates)
  test("recusa duplicados com espaços", rejectsSpacedDuplicates)
  test("não interpreta texto como atributos", ignoresAttributeLikeText)
  test("recusa atributo duplicado", rejectsDuplicateAttributes)
  test("aceita maior que no atributo", acceptsGreaterThanInAttribute)
  test("recusa atributo malformado", rejectsMalformedAttribute)
}

describe("segurança dos dados", suite)
