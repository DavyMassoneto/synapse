import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { expect } from "vitest"
import {
  TEAM_EXTENSIONS_CONFIG_FILE,
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_SUBAGENT,
  TEAM_TOOL_TASK_CREATE,
  TEAM_TOOL_TASK_LIST,
  TEAM_TOOL_WAIT_AGENT,
} from "#synapse/integration"
import { PiProcess, type PiProcessScenarioHandle, runPiProcessPrompt } from "../pi-process"
import {
  PI_PROCESS_MODEL_REFERENCE,
  PI_PROCESS_PROVIDER_URL,
  PI_PROCESS_TEXT_KIND,
  PI_PROCESS_TOOL_CALL_KIND,
  type PiProcessStep,
} from "../scripted-provider"
import {
  TEAM_DISTRIBUTION_BOARD_PROMPT,
  TEAM_DISTRIBUTION_BOARD_REPLY,
  TEAM_DISTRIBUTION_CREATE_PROMPT,
  TEAM_DISTRIBUTION_DESCRIPTION,
  TEAM_DISTRIBUTION_DONE_STEP,
  TEAM_DISTRIBUTION_EMPTY_ARGUMENTS,
  TEAM_DISTRIBUTION_INACTIVE_STATUS,
  TEAM_DISTRIBUTION_MEMBER_MARKER,
  TEAM_DISTRIBUTION_MEMBER_NAME,
  TEAM_DISTRIBUTION_MEMBER_REPLY,
  TEAM_DISTRIBUTION_MESSAGE,
  TEAM_DISTRIBUTION_MODULE_FAILURE,
  TEAM_DISTRIBUTION_PERSIST_PROMPT,
  TEAM_DISTRIBUTION_REFUSED_REPLY,
  TEAM_DISTRIBUTION_RESTORE_PROMPT,
  TEAM_DISTRIBUTION_RESTORED_REPLY,
  TEAM_DISTRIBUTION_SEND_PROMPT,
  TEAM_DISTRIBUTION_SESSION_DIRECTORY,
  TEAM_DISTRIBUTION_SESSION_FILE,
  TEAM_DISTRIBUTION_TASK,
  TEAM_DISTRIBUTION_TASK_DESCRIPTION,
  TEAM_DISTRIBUTION_TASK_SUBJECT,
  TEAM_DISTRIBUTION_TOOL_END_EVENT,
  TEAM_DISTRIBUTION_UNKNOWN_RECIPIENT,
  TEAM_DISTRIBUTION_WAIT_MILLISECONDS,
} from "./constants"

export async function smokeScenario(piProcess: PiProcessScenarioHandle): Promise<void> {
  configureMemberScenario(piProcess, [TEAM_DISTRIBUTION_DONE_STEP, TEAM_DISTRIBUTION_DONE_STEP])

  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_CREATE_PROMPT)
  const recordsText = JSON.stringify(piProcess.received.records())
  expect(recordsText).not.toContain(TEAM_DISTRIBUTION_MODULE_FAILURE)
  expect(recordsText).toContain(TEAM_DISTRIBUTION_MEMBER_REPLY)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_SUBAGENT, false)
}

export async function rejectsUnknownRecipientScenario(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([
    {
      kind: PI_PROCESS_TOOL_CALL_KIND,
      name: TEAM_TOOL_SEND_MESSAGE,
      argumentsJson: JSON.stringify({ agent: TEAM_DISTRIBUTION_UNKNOWN_RECIPIENT, message: TEAM_DISTRIBUTION_MESSAGE }),
    },
    { kind: PI_PROCESS_TEXT_KIND, text: TEAM_DISTRIBUTION_REFUSED_REPLY },
  ])

  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_SEND_PROMPT)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_SEND_MESSAGE, true)
}

export async function createsBoardTaskScenario(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([
    {
      kind: PI_PROCESS_TOOL_CALL_KIND,
      name: TEAM_TOOL_TASK_CREATE,
      argumentsJson: JSON.stringify({
        subject: TEAM_DISTRIBUTION_TASK_SUBJECT,
        description: TEAM_DISTRIBUTION_TASK_DESCRIPTION,
        blocked_by: [],
        write_scopes: [],
      }),
    },
    { kind: PI_PROCESS_TOOL_CALL_KIND, name: TEAM_TOOL_TASK_LIST, argumentsJson: TEAM_DISTRIBUTION_EMPTY_ARGUMENTS },
    { kind: PI_PROCESS_TEXT_KIND, text: TEAM_DISTRIBUTION_BOARD_REPLY },
  ])

  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_BOARD_PROMPT)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_TASK_CREATE, false)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_TASK_LIST, false)
}

export async function restoresMemberScenario(piProcess: PiProcessScenarioHandle): Promise<void> {
  configureMemberScenario(piProcess, [
    TEAM_DISTRIBUTION_DONE_STEP,
    {
      kind: PI_PROCESS_TOOL_CALL_KIND,
      name: TEAM_TOOL_LIST_AGENTS,
      argumentsJson: TEAM_DISTRIBUTION_EMPTY_ARGUMENTS,
    },
    { kind: PI_PROCESS_TEXT_KIND, text: TEAM_DISTRIBUTION_RESTORED_REPLY },
  ])
  const session = {
    path: join(piProcess.homeDirectory.home, TEAM_DISTRIBUTION_SESSION_FILE),
    directory: join(piProcess.homeDirectory.home, TEAM_DISTRIBUTION_SESSION_DIRECTORY),
  }
  piProcess.configureSession(session)

  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_PERSIST_PROMPT)
  await piProcess.close()
  const reopened = new PiProcess()
  reopened.replaceHome(piProcess.homeDirectory)
  try {
    reopened.configureSession(session)

    await runPiProcessPrompt(reopened, TEAM_DISTRIBUTION_RESTORE_PROMPT)
    const recordsText = JSON.stringify(reopened.received.records())
    expect(recordsText).toContain(TEAM_DISTRIBUTION_MEMBER_NAME)
    expect(recordsText).toContain(TEAM_DISTRIBUTION_INACTIVE_STATUS)
    expect(recordsText).toContain(PI_PROCESS_MODEL_REFERENCE)
    expectTeamDistributionToolEnd(reopened, TEAM_TOOL_LIST_AGENTS, false)
  } finally {
    await reopened.close()
  }
}

function configureMemberScenario(piProcess: PiProcessScenarioHandle, finalSteps: PiProcessStep[]): void {
  writeFileSync(
    join(piProcess.homeDirectory.agentDirectory, TEAM_EXTENSIONS_CONFIG_FILE),
    JSON.stringify({ memberExtensions: [fileURLToPath(PI_PROCESS_PROVIDER_URL)] }),
  )
  piProcess.homeDirectory.script({
    tracks: [
      {
        marker: TEAM_DISTRIBUTION_MEMBER_MARKER,
        steps: [{ kind: PI_PROCESS_TEXT_KIND, text: TEAM_DISTRIBUTION_MEMBER_REPLY }],
      },
      {
        steps: [
          {
            kind: PI_PROCESS_TOOL_CALL_KIND,
            name: TEAM_TOOL_SUBAGENT,
            argumentsJson: JSON.stringify({
              name: TEAM_DISTRIBUTION_MEMBER_NAME,
              description: TEAM_DISTRIBUTION_DESCRIPTION,
              task: TEAM_DISTRIBUTION_TASK,
            }),
          },
          {
            kind: PI_PROCESS_TOOL_CALL_KIND,
            name: TEAM_TOOL_WAIT_AGENT,
            argumentsJson: JSON.stringify({ timeout_ms: TEAM_DISTRIBUTION_WAIT_MILLISECONDS }),
          },
          ...finalSteps,
        ],
      },
    ],
  })
}

function expectTeamDistributionToolEnd(piProcess: PiProcessScenarioHandle, toolName: string, isError: boolean): void {
  expect(piProcess.received.records()).toContainEqual(
    expect.objectContaining({ type: TEAM_DISTRIBUTION_TOOL_END_EVENT, toolName, isError }),
  )
}
