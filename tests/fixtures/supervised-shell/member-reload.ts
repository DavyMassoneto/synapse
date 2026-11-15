import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { createAgentSession, SessionManager, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { TeamMemberResourceLoader } from "#synapse/integration/pi/agent-team"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import { cleanupMemberConfigFixture, memberConfigFixture } from "../member-extension-config"
import { SUPERVISED_TEST_OVERRIDE_SOURCE } from "./constants"
import { type SupervisedReloadFixture } from "./types"

export async function createSupervisedReloadFixture(override: boolean): Promise<SupervisedReloadFixture> {
  const fixture = memberConfigFixture(false)
  const shell = createSupervisedShell()
  const tools: ToolDefinition[] = []
  const settingsFile = join(fixture.agentDirectory, "settings.json")
  writeFileSync(fixture.extension, SUPERVISED_TEST_OVERRIDE_SOURCE)
  const extensions: string[] = []
  if (override) {
    extensions.push(fixture.extension)
  }
  writeFileSync(settingsFile, JSON.stringify({ defaultTools: ["bash"], extensions }))
  try {
    const loader = new TeamMemberResourceLoader({
      cwd: fixture.cwd,
      agentDirectory: fixture.agentDirectory,
      settings: fixture.settings,
      instructions: "",
      tools,
      shell,
    })
    await loader.reload()
    const { session } = await createAgentSession({
      cwd: fixture.cwd,
      settingsManager: fixture.settings,
      sessionManager: SessionManager.inMemory(fixture.cwd),
      resourceLoader: loader,
      customTools: tools,
    })
    await session.bindExtensions({})
    return { fixture, shell, session, settingsFile }
  } catch (error) {
    await shell.close()
    cleanupMemberConfigFixture(fixture)
    throw error
  }
}

export async function closeSupervisedReloadFixture(scenario: SupervisedReloadFixture): Promise<void> {
  try {
    await scenario.shell.close()
  } finally {
    scenario.session.dispose()
    cleanupMemberConfigFixture(scenario.fixture)
  }
}
