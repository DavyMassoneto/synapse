import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const { createJiti } = require("jiti");
const jiti = createJiti(import.meta.url, { tsconfigPaths: true });
const { createRenderers } = await jiti.import("../../src/integration/pi/advisor/rendering.ts");
const theme = {
  fg(_name, text) {
    return text;
  },
  bold(text) {
    return text;
  },
};

function verifyRendering() {
  const renderers = createRenderers();
  const lines = [];
  for (let index = 0; index < 10; index++) {
    lines.push(`line${index}`);
  }
  const content = lines.join("\n");
  const result = {
    content: [{ type: "text", text: content }],
    details: { model: "provider/original" },
  };
  const partial = renderers.renderResult(result, { isPartial: true, expanded: false }, theme, {});
  assert.match(partial.render(100).join(""), /consultando/);
  const compact = renderers.renderResult(result, { isPartial: false, expanded: false }, theme, {});
  assert.match(compact.render(100).join(""), /provider\/original/);
  assert.doesNotMatch(compact.render(100).join(""), /line9/);
  const expanded = renderers.renderResult(result, { isPartial: false, expanded: true }, theme, {
    lastComponent: compact,
  });
  assert.equal(expanded, compact);
  assert.match(expanded.render(100).join(""), /line9/);
  const error = renderers.renderResult(result, { isPartial: false, expanded: false }, theme, {
    isError: true,
  });
  assert.match(error.render(100).join(""), /line0/);
}

test("renderização usa o modelo histórico e reaproveita o componente", verifyRendering);
