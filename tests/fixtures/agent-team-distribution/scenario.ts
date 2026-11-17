import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { TEAM_EXTENSIONS_CONFIG_FILE, TEAM_TOOL_SUBAGENT } from "#synapse/integration/pi/agent-team"
import { type PiProcessScenarioHandle, type PiProcessSession } from "../pi-process"
import {
  SCRIPTED_PROVIDER_PROVIDER_URL,
  SCRIPTED_PROVIDER_TEXT_KIND,
  SCRIPTED_PROVIDER_TOOL_CALL_KIND,
  type ScriptedProviderStep,
} from "../scripted-provider"
import {
  TEAM_DISTRIBUTION_DESCRIPTION,
  TEAM_DISTRIBUTION_MEMBER_MARKER,
  TEAM_DISTRIBUTION_MEMBER_NAME,
  TEAM_DISTRIBUTION_MEMBER_REPLY,
  TEAM_DISTRIBUTION_PI_SETTINGS,
  TEAM_DISTRIBUTION_SESSION_DIRECTORY,
  TEAM_DISTRIBUTION_SESSION_FILE,
  TEAM_DISTRIBUTION_TASK,
} from "./constants"

export function configureMemberScenario(piProcess: PiProcessScenarioHandle, finalSteps: ScriptedProviderStep[]): void {
  writeFileSync(
    join(piProcess.homeDirectory.agentDirectory, TEAM_EXTENSIONS_CONFIG_FILE),
    JSON.stringify({ excludedMemberExtensions: [] }),
  )
  writeFileSync(
    join(piProcess.homeDirectory.agentDirectory, TEAM_DISTRIBUTION_PI_SETTINGS),
    JSON.stringify({ extensions: [fileURLToPath(SCRIPTED_PROVIDER_PROVIDER_URL)] }),
  )
  piProcess.homeDirectory.script({
    tracks: [
      {
        marker: TEAM_DISTRIBUTION_MEMBER_MARKER,
        steps: [{ kind: SCRIPTED_PROVIDER_TEXT_KIND, text: TEAM_DISTRIBUTION_MEMBER_REPLY }],
      },
      {
        steps: [
          {
            kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
            name: "team_task_create",
            argumentsJson: JSON.stringify({
              subject: TEAM_DISTRIBUTION_DESCRIPTION,
              description: TEAM_DISTRIBUTION_TASK,
              blocked_by: [],
              write_scopes: [],
            }),
          },
          {
            kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
            name: TEAM_TOOL_SUBAGENT,
            argumentsJson: JSON.stringify({
              name: TEAM_DISTRIBUTION_MEMBER_NAME,
              description: TEAM_DISTRIBUTION_DESCRIPTION,
              task_id: "task-1",
              expected_revision: 1,
            }),
          },
          ...finalSteps,
        ],
      },
    ],
  })
}

export function preparePersistentMemberScenario(
  piProcess: PiProcessScenarioHandle,
  finalSteps: ScriptedProviderStep[],
): PiProcessSession {
  configureMemberScenario(piProcess, finalSteps)
  const session = {
    path: join(piProcess.homeDirectory.home, TEAM_DISTRIBUTION_SESSION_FILE),
    directory: join(piProcess.homeDirectory.home, TEAM_DISTRIBUTION_SESSION_DIRECTORY),
  }
  piProcess.configureSession(session)
  return session
}
