import { describe, expect, test } from "vitest"
import { makeTeamSut, startAlice } from "./team-scenario"

function self(): void {
  const { team } = makeTeamSut()
  expect(team.send("alice", "alice", "x").kind).toBe("refused")
}

function missing(): void {
  const { team } = makeTeamSut()
  expect(team.send("lead", "ninguém", "x").kind).toBe("refused")
}

function interruptLead(): void {
  const { team } = makeTeamSut()
  expect(team.interrupt("lead").kind).toBe("refused")
}

async function sender(): Promise<void> {
  const { team, lead } = await startAlice()
  team.send("alice", "lead", "oi")
  expect(lead.deliveries).toEqual(['Mensagem do agente "alice":\noi'])
}

async function steer(): Promise<void> {
  const { team, sessions } = await startAlice()
  sessions.session.streaming = true
  team.send("lead", "alice", "oi")
  expect(sessions.session.steers).toEqual(['Mensagem do agente "lead":\noi'])
}

async function preparing(): Promise<void> {
  const { team, sessions } = await startAlice()
  team.send("lead", "alice", "oi")
  sessions.session.streaming = true
  sessions.session.emit({ kind: "execution_started" })
  expect(sessions.session.steers).toHaveLength(1)
}

async function pending(): Promise<void> {
  const { team, sessions, lead } = await startAlice()
  team.send("lead", "alice", "oi")
  sessions.session.emit({ kind: "execution_settled", aborted: false, answer: "fim" })
  expect(sessions.session.prompts).toHaveLength(2)
  expect(lead.deliveries).toHaveLength(0)
}

async function journalAccept(): Promise<void> {
  const { team, sessions } = await startAlice()
  sessions.journal.failAt = 3
  expect(team.send("lead", "alice", "oi").kind).toBe("refused")
  expect(sessions.journal.checkpoint.pending).toEqual(["x"])
}

async function unknownSender(): Promise<void> {
  const { team } = makeTeamSut()
  expect(team.send("inexistente", "lead", "oi").kind).toBe("refused")
}

async function interruptionIsRequested(): Promise<void> {
  const { team } = await startAlice()
  expect(team.interrupt("alice")).toEqual({ kind: "interrupt_requested" })
}

function register(): void {
  test("interrupção confirma somente o pedido", interruptionIsRequested)
  test("remetente inexistente recusado", unknownSender)
  test("recusa mensagem a si", self)
  test("recusa destino inexistente", missing)
  test("recusa interrupção do lead", interruptLead)
  test("identifica remetente", sender)
  test("mensagem durante streaming", steer)
  test("enfileira durante preparação", preparing)
  test("reinicia quando há pendências", pending)
  test("recusa falha ao aceitar mensagem", journalAccept)
}

describe("message-delivery", register)
