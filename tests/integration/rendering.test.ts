import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { PlainTheme, prepareHostDirectory, RENDER_RESULT, TypedAdvisorHost } from "../fixtures"

let host: TypedAdvisorHost

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory())
}
function cleanup(): void {
  host.cleanup()
}

function partialRendering(): void {
  if (!host.tool?.renderResult) {
    throw new Error("renderizador ausente")
  }
  const component = host.tool.renderResult(RENDER_RESULT, { isPartial: true, expanded: false }, new PlainTheme(), {})
  expect(component.render(100).join("")).toMatch(/consultando/)
}

function compactRendering(): void {
  if (!host.tool?.renderResult) {
    throw new Error("renderizador ausente")
  }
  const component = host.tool.renderResult(RENDER_RESULT, { isPartial: false, expanded: false }, new PlainTheme(), {})
  expect(component.render(100).join("")).not.toMatch(/line9/)
}

function expandedRendering(): void {
  if (!host.tool?.renderResult) {
    throw new Error("renderizador ausente")
  }
  const render = host.tool.renderResult
  const theme = new PlainTheme()
  const compact = render(RENDER_RESULT, { isPartial: false, expanded: false }, theme, {})
  const expanded = render(RENDER_RESULT, { isPartial: false, expanded: true }, theme, {
    lastComponent: compact,
  })
  expect(expanded).toBe(compact)
  expect(expanded.render(100).join("")).toMatch(/line9/)
}

function historicalModel(): void {
  if (!host.tool?.renderResult) {
    throw new Error("renderizador ausente")
  }
  host.advisor.configuration.selectModel("provider/other")
  const component = host.tool.renderResult(RENDER_RESULT, { isPartial: false, expanded: false }, new PlainTheme(), {})
  expect(component.render(100).join("")).toMatch(/provider\/original/)
}

function errorRendering(): void {
  if (!host.tool?.renderResult) {
    throw new Error("renderizador ausente")
  }
  const component = host.tool.renderResult(RENDER_RESULT, { isPartial: false, expanded: false }, new PlainTheme(), {
    isError: true,
  })
  expect(component.render(100).join("")).toMatch(/line0/)
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)

  test("renderiza consulta parcial", partialRendering)
  test("renderiza resumo compacto", compactRendering)
  test("reutiliza componente ao expandir", expandedRendering)
  test("preserva modelo histórico", historicalModel)
  test("renderiza erro", errorRendering)
}

describe("rendering", registerTests)
