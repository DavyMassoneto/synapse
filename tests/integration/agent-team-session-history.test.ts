import { describe, expect, test } from "vitest"
import { readTeamHistory } from "#synapse/integration"
import { TEAM_HISTORY_INVALID_ENTRIES, TEAM_HISTORY_TEST_ENTRIES, TeamHistoryTestSession } from "../fixtures"

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

function registerTests(): void {
  test("restaura somente catálogo do lead", filtersLeadCatalog)
  test("lê histórico de tarefas", readsTasks)
  test("recusa tarefa inválida", rejectsInvalidTask)
}

describe("histórico da equipe", registerTests)
