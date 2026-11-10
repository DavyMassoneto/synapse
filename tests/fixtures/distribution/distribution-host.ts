import { ExtensionRunner, SessionManager } from "@earendil-works/pi-coding-agent"
import { TestUI } from "../context"
import { DistributionRegistry } from "./distribution-registry"
import { createRuntime, loadExtension, resolveEntrypoint } from "./distribution-setup"
import { type DistributionResult } from "./types"

export async function runDistribution(home: string): Promise<DistributionResult> {
  const loaded = await loadExtension(home, resolveEntrypoint())
  const registry = new DistributionRegistry(await createRuntime(home))
  const runner = new ExtensionRunner(loaded.extensions, loaded.runtime, home, SessionManager.inMemory(home), registry)
  try {
    const ui = new TestUI()
    runner.getUIContext().notify = ui.notify.bind(ui)
    const command = runner.getCommand("advisor")
    const tool = runner.getToolDefinition("advisor")
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
