import { describe, expect, test } from "vitest"
import { teamPanelLines } from "#synapse/integration"
import { type TaskView, type TeamAgentRow } from "#synapse/modules"
import { TEAM_PANEL_TEST_AGENT, TEAM_PANEL_TEST_EMPTY, TEAM_PANEL_TEST_TASK } from "../fixtures"

function emptyTeam(): void {
  expect(teamPanelLines(TEAM_PANEL_TEST_EMPTY)).toHaveLength(1)
}

function boundedLines(): void {
  const agents = Array.from({ length: 9 }, (_, index) => ({ ...TEAM_PANEL_TEST_AGENT, name: `agente ${index}` }))
  const tasks = Array.from({ length: 9 }, (_, index) => ({ ...TEAM_PANEL_TEST_TASK, id: `${index}` }))
  expect(teamPanelLines({ agents, tasks, events: ["um", "dois", "três", "quatro"] })).toHaveLength(12)
}

function activeFirst(): void {
  const agents: TeamAgentRow[] = [TEAM_PANEL_TEST_AGENT, { ...TEAM_PANEL_TEST_AGENT, name: "ativo", state: "working" }]
  expect(teamPanelLines({ agents, tasks: [], events: [] })[1]?.text).toContain("ativo")
}

function workingTasksFirst(): void {
  const tasks: TaskView[] = [TEAM_PANEL_TEST_TASK, { ...TEAM_PANEL_TEST_TASK, id: "ativa", status: "in_progress" }]
  const lines = teamPanelLines({ agents: [TEAM_PANEL_TEST_AGENT], tasks, events: [] })
  expect(lines[3]?.text).toContain("ativa")
}

function controlsDoNotCreateLines(): void {
  const agents = [TEAM_PANEL_TEST_AGENT, { ...TEAM_PANEL_TEST_AGENT, name: "um\ndois\u0007três" }]
  expect(teamPanelLines({ agents, tasks: [], events: [] })[2]?.text).toContain("um dois três")
}

function truncatesLongUnicodeText(): void {
  const agents = [TEAM_PANEL_TEST_AGENT, { ...TEAM_PANEL_TEST_AGENT, name: "😀".repeat(140) }]
  const lines = teamPanelLines({ agents, tasks: [], events: [] })
  const line = lines[2]
  expect(line).toBeDefined()
  if (line) {
    expect(Array.from(line.text)).toHaveLength(120)
    expect(line.text.endsWith("…")).toBe(true)
  }
}

function registerTests(): void {
  test("mostra estado vazio", emptyTeam)
  test("limita linhas", boundedLines)
  test("exibe agentes ativos primeiro", activeFirst)
  test("exibe tarefas em andamento primeiro", workingTasksFirst)
  test("remove controles das linhas", controlsDoNotCreateLines)
  test("limita texto Unicode sem quebrar caracteres", truncatesLongUnicodeText)
}

describe("painel da equipe", registerTests)
