import { rmSync } from "node:fs"
import { join } from "node:path"
import { SessionManager } from "@earendil-works/pi-coding-agent"
import { vi } from "vitest"
import { PiTeamTaskContext, type TeamMemberSessionRequest } from "#synapse/integration/pi/agent-team"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import { ToolsTeamDouble } from "../agent-team"
import { fixtureModel } from "../context"
import {
  MEMBER_CONFIG_CONTEXT_WINDOW,
  MEMBER_CONFIG_MODEL_ID,
  MEMBER_CONFIG_MODEL_PROVIDER,
  MEMBER_CONFIG_NAME,
  MEMBER_CONFIG_STORAGE,
  MEMBER_CONFIG_THINKING,
} from "./constants"
import { type MemberConfigFixture } from "./types"

export function memberConfigSessionRequest(fixture: MemberConfigFixture): TeamMemberSessionRequest {
  const model = fixtureModel(MEMBER_CONFIG_MODEL_PROVIDER, MEMBER_CONFIG_MODEL_ID, MEMBER_CONFIG_CONTEXT_WINDOW)
  const taskContext = new PiTeamTaskContext(new ToolsTeamDouble(), MEMBER_CONFIG_NAME)
  return {
    shell: createSupervisedShell(),
    cwd: fixture.cwd,
    projectTrusted: false,
    instructions: "",
    taskContext: taskContext.register.bind(taskContext),
    tools: [],
    storage: SessionManager.create(fixture.cwd, join(fixture.directory, MEMBER_CONFIG_STORAGE)),
    selection: { model, thinkingLevel: MEMBER_CONFIG_THINKING },
  }
}

export function cleanupMemberSessionFixture(fixture: MemberConfigFixture): void {
  vi.unstubAllEnvs()
  rmSync(fixture.directory, { recursive: true, force: true })
}

export function cleanupMemberConfigFixture(fixture: MemberConfigFixture): void {
  fixture.loader.getExtensions().runtime.invalidate()
  rmSync(fixture.directory, { recursive: true, force: true })
}
