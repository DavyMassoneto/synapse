import assert from "node:assert/strict";
import { type AgentToolResult } from "@earendil-works/pi-coding-agent";
import { test } from "vitest";
import { type AdvisorRenderTheme, type AdvisorToolDetails } from "#synapse/integration/index.js";
import { TypedAdvisorHost } from "../fixtures/typed-host.ts";

class PlainTheme implements AdvisorRenderTheme {
  fg(_color: Parameters<AdvisorRenderTheme["fg"]>[0], text: string): string {
    return text;
  }
  bold(text: string): string {
    return text;
  }
}

const RESULT: AgentToolResult<AdvisorToolDetails> = {
  content: [
    { type: "text", text: "line0\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9" },
  ],
  details: { model: "provider/original" },
};

function partialRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool?.renderResult);
    const component = host.tool.renderResult(
      RESULT,
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
      RESULT,
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
    const compact = render(RESULT, { isPartial: false, expanded: false }, theme, {});
    const expanded = render(RESULT, { isPartial: false, expanded: true }, theme, {
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
      RESULT,
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
      RESULT,
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
