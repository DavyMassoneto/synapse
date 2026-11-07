import assert from "node:assert/strict";
import { test } from "node:test";
import { type AgentToolResult } from "@earendil-works/pi-coding-agent";
import { type AdvisorRenderTheme, type AdvisorToolDetails } from "@/integration";
import { TypedAdvisorHost } from "../fixtures/typed-host.ts";

class PlainTheme implements AdvisorRenderTheme {
  fg(_color: Parameters<AdvisorRenderTheme["fg"]>[0], text: string): string {
    return text;
  }
  bold(text: string): string {
    return text;
  }
}

function historicalRendering(): void {
  const host = new TypedAdvisorHost();
  try {
    assert.ok(host.tool);
    const render = host.tool.renderResult;
    assert.ok(render);
    const theme = new PlainTheme();
    const lines: string[] = [];
    for (let index = 0; index < 10; index++) {
      lines.push(`line${index}`);
    }
    const result: AgentToolResult<AdvisorToolDetails> = {
      content: [{ type: "text", text: lines.join("\n") }],
      details: { model: "provider/original" },
    };
    host.advisor.selectModel("provider/other");
    const partial = render(result, { isPartial: true, expanded: false }, theme, {});
    assert.match(partial.render(100).join(""), /consultando/);
    const compact = render(result, { isPartial: false, expanded: false }, theme, {});
    assert.match(compact.render(100).join(""), /provider\/original/);
    assert.doesNotMatch(compact.render(100).join(""), /line9/);
    const expanded = render(result, { isPartial: false, expanded: true }, theme, {
      lastComponent: compact,
    });
    assert.equal(expanded, compact);
    assert.match(expanded.render(100).join(""), /line9/);
    const error = render(result, { isPartial: false, expanded: false }, theme, { isError: true });
    assert.match(error.render(100).join(""), /line0/);
  } finally {
    host.cleanup();
  }
}

test("renderização preserva modelo histórico e reaproveita componente", historicalRendering);
