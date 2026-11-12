import { describe, expect, test } from "vitest"
import { makeTeamSut, startAlice } from "./team-scenario"

async function events(): Promise<void> {
  const { team } = await startAlice()
  team.send("alice", "lead", "1")
  team.send("alice", "lead", "2")
  team.send("alice", "lead", "3")
  team.send("alice", "lead", "4")
  expect(team.overview().events).toHaveLength(3)
}

async function eventClock(): Promise<void> {
  const { team } = await startAlice()
  expect(team.overview().events[0]).toContain("12:00")
}

function leadRunning(): void {
  const { team, lead } = makeTeamSut()
  lead.running = true
  expect(team.overview().agents[0]?.state).toBe("working")
}

async function taskPanel(): Promise<void> {
  const { team, lead } = makeTeamSut()
  const result = team.createTask({ subject: "x", description: "x", blockedBy: [], writeScopes: [] })
  expect(result.kind).toBe("accepted")
  expect(lead.tasks).toHaveLength(1)
  expect(lead.panels).toHaveLength(1)
}

function register(): void {
  test("eventos limitados", events)
  test("evento contém horário do relógio", eventClock)
  test("lead em execução", leadRunning)
  test("quadro atualiza painel", taskPanel)
}

describe("team-overview", register)
