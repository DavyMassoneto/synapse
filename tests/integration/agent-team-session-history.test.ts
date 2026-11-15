import { describe, expect, test } from "vitest"
import { readTeamHistory } from "#synapse/integration/pi/agent-team"
import {
  TEAM_HISTORY_CLEAN_ENTRIES,
  TEAM_HISTORY_CLEAN_TEST,
  TEAM_HISTORY_INVALID_ENTRIES,
  TEAM_HISTORY_TEST_ENTRIES,
  TeamHistoryTestSession,
} from "../fixtures"

function filtersLeadCatalog(): void {
  const history = new TeamHistoryTestSession(TEAM_HISTORY_TEST_ENTRIES)
  expect(readTeamHistory(history, "lead-a").members.map((member) => member.name)).toStrictEqual(["ana"])
}

function readsTasks(): void {
  const history = new TeamHistoryTestSession(TEAM_HISTORY_TEST_ENTRIES)
  expect(readTeamHistory(history, "lead-a").tasks.map((task) => task.id)).toStrictEqual(["t"])
}

function rejectsInvalidTask(): void {
  const history = new TeamHistoryTestSession(TEAM_HISTORY_INVALID_ENTRIES)
  expect(readTeamHistory.bind(null, history, "lead-a")).toThrow()
}

function replaysCleanBatch(): void {
  const history = readTeamHistory(new TeamHistoryTestSession(TEAM_HISTORY_CLEAN_ENTRIES), "lead-a")
  expect(history.tasks).toMatchObject([
    { id: "task-1", revision: 4, status: "deleted" },
    { id: "task-2", revision: 2, status: "pending", blockedBy: [] },
  ])
}

function registerTests(): void {
  test(TEAM_HISTORY_CLEAN_TEST, replaysCleanBatch)
  test("restaura somente catálogo do lead", filtersLeadCatalog)
  test("lê histórico de tarefas", readsTasks)
  test("recusa tarefa inválida", rejectsInvalidTask)
}

describe("histórico da equipe", registerTests)
