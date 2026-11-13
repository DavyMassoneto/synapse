import { describe, expect, test } from "vitest"
import {
  TEAM_TOOL_LIST_AGENTS,
  TEAM_TOOL_SEND_MESSAGE,
  TEAM_TOOL_SUBAGENT,
  TEAM_TOOL_TASK_CREATE,
  TEAM_TOOL_TASK_LIST,
} from "#synapse/integration"
import {
  configureMemberScenario,
  PI_PROCESS_TIMEOUT_MS,
  PiProcess,
  type PiProcessScenarioHandle,
  preparePersistentMemberScenario,
  runPiProcessPrompt,
  runWithPiProcess,
  SCRIPTED_PROVIDER_MODEL_REFERENCE,
  SCRIPTED_PROVIDER_TEXT_KIND,
  SCRIPTED_PROVIDER_TOOL_CALL_KIND,
  TEAM_DISTRIBUTION_BOARD_PROMPT,
  TEAM_DISTRIBUTION_BOARD_REPLY,
  TEAM_DISTRIBUTION_CREATE_PROMPT,
  TEAM_DISTRIBUTION_DONE_STEP,
  TEAM_DISTRIBUTION_EMPTY_ARGUMENTS,
  TEAM_DISTRIBUTION_INACTIVE_STATUS,
  TEAM_DISTRIBUTION_MEMBER_NAME,
  TEAM_DISTRIBUTION_MEMBER_REPLY,
  TEAM_DISTRIBUTION_MESSAGE,
  TEAM_DISTRIBUTION_MODULE_FAILURE,
  TEAM_DISTRIBUTION_PERSIST_PROMPT,
  TEAM_DISTRIBUTION_REFUSED_REPLY,
  TEAM_DISTRIBUTION_RESTORE_PROMPT,
  TEAM_DISTRIBUTION_RESTORED_REPLY,
  TEAM_DISTRIBUTION_SEND_PROMPT,
  TEAM_DISTRIBUTION_TASK_DESCRIPTION,
  TEAM_DISTRIBUTION_TASK_SUBJECT,
  TEAM_DISTRIBUTION_TOOL_END_EVENT,
  TEAM_DISTRIBUTION_UNKNOWN_RECIPIENT,
} from "../fixtures"

function expectTeamDistributionToolEnd(piProcess: PiProcessScenarioHandle, toolName: string, isError: boolean): void {
  expect(piProcess.received.records()).toContainEqual(
    expect.objectContaining({ type: TEAM_DISTRIBUTION_TOOL_END_EVENT, toolName, isError }),
  )
}

async function createsMember(piProcess: PiProcessScenarioHandle): Promise<void> {
  configureMemberScenario(piProcess, [TEAM_DISTRIBUTION_DONE_STEP, TEAM_DISTRIBUTION_DONE_STEP])
  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_CREATE_PROMPT)
  const recordsText = JSON.stringify(piProcess.received.records())
  expect(recordsText).not.toContain(TEAM_DISTRIBUTION_MODULE_FAILURE)
  expect(recordsText).toContain(TEAM_DISTRIBUTION_MEMBER_REPLY)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_SUBAGENT, false)
}

async function rejectsUnknownRecipient(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([
    {
      kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
      name: TEAM_TOOL_SEND_MESSAGE,
      argumentsJson: JSON.stringify({ agent: TEAM_DISTRIBUTION_UNKNOWN_RECIPIENT, message: TEAM_DISTRIBUTION_MESSAGE }),
    },
    { kind: SCRIPTED_PROVIDER_TEXT_KIND, text: TEAM_DISTRIBUTION_REFUSED_REPLY },
  ])
  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_SEND_PROMPT)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_SEND_MESSAGE, true)
}

async function createsBoardTask(piProcess: PiProcessScenarioHandle): Promise<void> {
  piProcess.homeDirectory.script([
    {
      kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
      name: TEAM_TOOL_TASK_CREATE,
      argumentsJson: JSON.stringify({
        subject: TEAM_DISTRIBUTION_TASK_SUBJECT,
        description: TEAM_DISTRIBUTION_TASK_DESCRIPTION,
        blocked_by: [],
        write_scopes: [],
      }),
    },
    {
      kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
      name: TEAM_TOOL_TASK_LIST,
      argumentsJson: TEAM_DISTRIBUTION_EMPTY_ARGUMENTS,
    },
    { kind: SCRIPTED_PROVIDER_TEXT_KIND, text: TEAM_DISTRIBUTION_BOARD_REPLY },
  ])
  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_BOARD_PROMPT)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_TASK_CREATE, false)
  expectTeamDistributionToolEnd(piProcess, TEAM_TOOL_TASK_LIST, false)
}

async function restoresMember(piProcess: PiProcessScenarioHandle): Promise<void> {
  const session = preparePersistentMemberScenario(piProcess, [
    TEAM_DISTRIBUTION_DONE_STEP,
    {
      kind: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
      name: TEAM_TOOL_LIST_AGENTS,
      argumentsJson: TEAM_DISTRIBUTION_EMPTY_ARGUMENTS,
    },
    { kind: SCRIPTED_PROVIDER_TEXT_KIND, text: TEAM_DISTRIBUTION_RESTORED_REPLY },
  ])
  await runPiProcessPrompt(piProcess, TEAM_DISTRIBUTION_PERSIST_PROMPT)
  await piProcess.close()
  const reopened = new PiProcess(piProcess.homeDirectory)
  try {
    reopened.configureSession(session)
    await runPiProcessPrompt(reopened, TEAM_DISTRIBUTION_RESTORE_PROMPT)
    const recordsText = JSON.stringify(reopened.received.records())
    expect(recordsText).toContain(TEAM_DISTRIBUTION_MEMBER_NAME)
    expect(recordsText).toContain(TEAM_DISTRIBUTION_INACTIVE_STATUS)
    expect(recordsText).toContain(SCRIPTED_PROVIDER_MODEL_REFERENCE)
    expectTeamDistributionToolEnd(reopened, TEAM_TOOL_LIST_AGENTS, false)
  } finally {
    await reopened.close()
  }
}

function registerTests(): void {
  test(
    "pi cria sessão real de membro sem erro de carregador",
    runWithPiProcess.bind(undefined, createsMember),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "mensagem para agente inexistente vira erro de ferramenta",
    runWithPiProcess.bind(undefined, rejectsUnknownRecipient),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "pi cria e lista tarefa no quadro compartilhado",
    runWithPiProcess.bind(undefined, createsBoardTask),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    "novo processo restaura membro parado da mesma sessão",
    runWithPiProcess.bind(undefined, restoresMember),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe("distribuição da equipe de agentes", registerTests)
