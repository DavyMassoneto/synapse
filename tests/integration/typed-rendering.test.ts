import assert from "node:assert/strict";
import { test } from "vitest";
import { PlainTheme, RENDER_RESULT, TypedAdvisorHost } from "../fixtures/index.js";

function partialRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    const component = host.tool.renderResult(
      RENDER_RESULT,
      { isPartial: true, expanded: false },
      new PlainTheme(),
      {},
    );
    assert.match(component.render(100).join(""), /consultando/);
  } finally {
    host.cleanup();
  }
}

function compactRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    const component = host.tool.renderResult(
      RENDER_RESULT,
      { isPartial: false, expanded: false },
      new PlainTheme(),
      {},
    );
    assert.doesNotMatch(component.render(100).join(""), /line9/);
  } finally {
    host.cleanup();
  }
}

function expandedRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    const render = host.tool.renderResult;
    const theme = new PlainTheme();
    const compact = render(RENDER_RESULT, { isPartial: false, expanded: false }, theme, {});
    const expanded = render(RENDER_RESULT, { isPartial: false, expanded: true }, theme, {
      lastComponent: compact,
    });
    assert.equal(expanded, compact);
    assert.match(expanded.render(100).join(""), /line9/);
  } finally {
    host.cleanup();
  }
}

function historicalModel(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    host.advisor.selectModel("provider/other");
    const component = host.tool.renderResult(
      RENDER_RESULT,
      { isPartial: false, expanded: false },
      new PlainTheme(),
      {},
    );
    assert.match(component.render(100).join(""), /provider\/original/);
  } finally {
    host.cleanup();
  }
}

function errorRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    const component = host.tool.renderResult(
      RENDER_RESULT,
      { isPartial: false, expanded: false },
      new PlainTheme(),
      { isError: true },
    );
    assert.match(component.render(100).join(""), /line0/);
  } finally {
    host.cleanup();
  }
}

test("renderiza consulta parcial", partialRendering);
test("renderiza resumo compacto", compactRendering);
test("reutiliza componente ao expandir", expandedRendering);
test("preserva modelo histórico", historicalModel);
test("renderiza erro", errorRendering);
