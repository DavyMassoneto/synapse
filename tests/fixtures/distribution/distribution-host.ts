import { ExtensionRunner, SessionManager } from "@earendil-works/pi-coding-agent"
import { ADVISOR_NAME } from "#synapse/integration"
import { TestUI } from "../context"
import { type DistributionEnvironment } from "./distribution-environment"
import { DistributionRegistry } from "./distribution-registry"
import { createRuntime, loadExtension, resolveEntrypoint } from "./distribution-setup"
import { type DistributionResult } from "./types"

export async function runDistribution(environment: DistributionEnvironment): Promise<DistributionResult> {
  const { home } = environment
  const loaded = await loadExtension(environment, resolveEntrypoint())
  const registry = new DistributionRegistry(await createRuntime(environment.agentDirectory))
  const runner = new ExtensionRunner(loaded.extensions, loaded.runtime, home, SessionManager.inMemory(home), registry)
  try {
    const ui = new TestUI()
    runner.getUIContext().notify = ui.notify.bind(ui)
    const command = runner.getCommand(ADVISOR_NAME)
    const tool = runner.getToolDefinition(ADVISOR_NAME)
    if (command && tool) {
      await command.handler("", runner.createCommandContext())
      const result = await tool.execute("id", {}, undefined, undefined, runner.createToolContext("id", undefined))
      return { notices: ui.notices, lookups: registry.fake.calls, isError: result.isError === true }
    }
    throw new Error("comando ou ferramenta ausente")
  } finally {
    await runner.emit({ type: "session_shutdown", reason: "quit" })
    runner.invalidate()
  }
}
