import { afterEach, beforeEach, expect, test } from "vitest";
import { prepareHostDirectory, TEST_USAGE, TestContext, TypedAdvisorHost } from "../fixtures";

let host: TypedAdvisorHost;
let context: TestContext;

function prepare(): void {
  host = new TypedAdvisorHost(prepareHostDirectory());
  context = new TestContext();
}
function cleanup(): void {
  host.cleanup();
}

async function successfulConsultation(): Promise<void> {
  if (!host.tool) {
    throw new Error("ferramenta ausente");
  }
  const result = await host.tool.execute("id", {}, undefined, undefined, context);
  expect(result.content[0].type).toBe("text");
  expect(result.usage).toStrictEqual(TEST_USAGE);
  expect(result.details?.model).toBe("provider/model");
}

async function abortedProvider(): Promise<void> {
  context.modelRegistry.stopReason = "aborted";
  if (!host.tool) {
    throw new Error("ferramenta ausente");
  }
  const result = await host.tool.execute("id", {}, undefined, undefined, context);
  const content = result.content[0];
  expect(content.type).toBe("text");
  if (content.type !== "text") {
    throw new Error("conteúdo não textual");
  }
  expect(content.text).toMatch(/cancelada/);
}

async function projectionFailure(): Promise<void> {
  context.sessionManager.projectionError = true;
  if (!host.tool) {
    throw new Error("ferramenta ausente");
  }
  const result = await host.tool.execute("id", {}, undefined, undefined, context);
  const content = result.content[0];
  expect(content.type).toBe("text");
  if (content.type !== "text") {
    throw new Error("conteúdo não textual");
  }
  expect(content.text).toMatch(/projection failed/);
  expect(context.modelRegistry.calls).toBe(0);
}

async function registeredShutdown(): Promise<void> {
  for (const handler of host.shutdowns) {
    await handler({ type: "session_shutdown", reason: "quit" }, context);
  }
  if (!host.tool) {
    throw new Error("ferramenta ausente");
  }
  const result = await host.tool.execute("id", {}, undefined, undefined, context);
  const content = result.content[0];
  expect(content.type).toBe("text");
  if (content.type !== "text") {
    throw new Error("conteúdo não textual");
  }
  expect(content.text).toMatch(/cancelada/);
  expect(context.modelRegistry.calls).toBe(0);
}

beforeEach(prepare);
afterEach(cleanup);

test("consulta registrada preserva uso e modelo", successfulConsultation);
test("provedor abortado devolve cancelamento", abortedProvider);
test("falha de projeção não consulta provedor", projectionFailure);
test("shutdown registrado impede consulta", registeredShutdown);
