import { describe, expect, test } from "vitest"
import { TEAM_TEST_ALICE_REQUEST } from "./constants"
import { makeTeamSut, startAlice } from "./team-scenario"

async function waitUnread(): Promise<void> {
  const { team } = await startAlice()
  team.send("alice", "lead", "oi")
  expect(await team.wait("lead", 100)).toEqual({ kind: "wait_completed", timedOut: false })
}

async function waitArrival(): Promise<void> {
  const { team } = makeTeamSut()
  const waiting = team.wait("lead", 1000)
  await team.start(TEAM_TEST_ALICE_REQUEST)
  team.send("alice", "lead", "oi")
  expect(await waiting).toEqual({ kind: "wait_completed", timedOut: false })
}

async function waitTimeout(): Promise<void> {
  const { team } = makeTeamSut()
  expect(await team.wait("lead", 1)).toEqual({ kind: "wait_completed", timedOut: true })
}

async function waitCancel(): Promise<void> {
  const { team } = makeTeamSut()
  const controller = new AbortController()
  const waiting = team.wait("lead", 1000, controller.signal)
  controller.abort()
  await expect(waiting).rejects.toThrow()
}

async function waitClose(): Promise<void> {
  const { team } = makeTeamSut()
  const waiting = team.wait("lead", 1000)
  await team.suspend()
  expect(await waiting).toEqual({ kind: "wait_completed", timedOut: false })
}

async function leadWaiting(): Promise<void> {
  const { team } = await startAlice()
  const waiting = team.wait("lead", 1000)
  expect(team.overview().agents[0]?.state).toBe("waiting")
  team.send("alice", "lead", "x")
  expect(await waiting).toEqual({ kind: "wait_completed", timedOut: false })
}

async function unknownMemberWait(): Promise<void> {
  const { team } = makeTeamSut()
  const waiting = team.wait("missing", 1)
  expect(await waiting).toEqual(expect.objectContaining({ kind: "refused" }))
}

async function suspendedWait(): Promise<void> {
  const { team } = makeTeamSut()
  await team.suspend()
  expect(await team.wait("lead", 1)).toEqual(expect.objectContaining({ kind: "refused" }))
}

async function seenArrival(): Promise<void> {
  const { team } = await startAlice()
  team.send("alice", "lead", "oi")
  team.markLeadSeen()
  expect(await team.wait("lead", 1)).toEqual({ kind: "wait_completed", timedOut: true })
}

function register(): void {
  test("espera de membro inexistente é recusada", unknownMemberWait)
  test("espera após suspensão é recusada", suspendedWait)
  test("mensagem vista não encerra espera", seenArrival)
  test("espera retorno imediato", waitUnread)
  test("espera acorda na chegada", waitArrival)
  test("espera expira", waitTimeout)
  test("cancelamento rejeita", waitCancel)
  test("suspensão encerra espera", waitClose)
  test("visão do lead esperando", leadWaiting)
}

describe("inbox-wait", register)
