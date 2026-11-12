import { describe, expect, test } from "vitest"
import { createPiTeamLeadSession, PiTeamLifecycle } from "#synapse/integration"
import { fixtureModel, LifecycleTeamDouble, TeamLeadContext, TeamLeadHost } from "../fixtures"

async function suspendsBeforeDetach(): Promise<void> {
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  const team = new LifecycleTeamDouble(lead)
  const events = new PiTeamLifecycle(lead, team)
  await events.sessionStart(
    { type: "session_start", reason: "startup" },
    new TeamLeadContext(fixtureModel("provider", "model", 100000)),
  )
  await events.sessionShutdown({ type: "session_shutdown", reason: "quit" })
  expect(team.attachedDuringSuspend).toBe(true)
  expect(lead.context.bind(lead)).toThrow(/não está vinculada/)
}

function refusesDetachedSession(): void {
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  expect(lead.context.bind(lead)).toThrow(/não está vinculada/)
}

function deliversSteeringNotice(): void {
  const host = new TeamLeadHost()
  const lead = createPiTeamLeadSession(host)
  lead.deliver("Resultado do membro")
  expect(host.notices).toHaveLength(1)
  expect(JSON.stringify(host.notices[0])).toContain('"triggerTurn":true')
  expect(JSON.stringify(host.notices[0])).toContain('"deliverAs":"steer"')
}

function showsRpcWidget(): void {
  const context = new TeamLeadContext(fixtureModel("provider", "model", 100000))
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  lead.attach(context)
  lead.show({ agents: [], tasks: [], events: [] })
  expect(context.widgets).toHaveLength(1)
  expect(context.widgets[0]).toContain("nenhum subagente")
}

function registerTests(): void {
  test("suspende membros antes de desanexar a sessão", suspendsBeforeDetach)
  test("recusa acesso à sessão desanexada", refusesDetachedSession)
  test("aviso entregue ao lead solicita turno por steer", deliversSteeringNotice)
  test("modo RPC recebe painel como linhas de texto", showsRpcWidget)
}

describe("ciclo de vida da equipe", registerTests)
