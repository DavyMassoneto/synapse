import { describe, expect, test } from "vitest"
import { startAlice } from "./team-scenario"

async function finished(): Promise<void> {
  const { sessions, lead } = await startAlice()
  sessions.session.emit({ kind: "execution_settled", aborted: false, answer: "feito" })
  expect(lead.deliveries[0]).toContain("feito")
}

async function failure(): Promise<void> {
  const { sessions, lead } = await startAlice()
  sessions.session.emit({ kind: "assistant_response", model: "x", failure: "erro" })
  sessions.session.emit({ kind: "execution_settled", aborted: false })
  expect(lead.deliveries[0]).toContain("erro")
}

async function interrupted(): Promise<void> {
  const { sessions, lead } = await startAlice()
  sessions.session.emit({ kind: "execution_settled", aborted: true })
  expect(lead.deliveries[0]).toContain("interrompido")
}

async function noAnswer(): Promise<void> {
  const { sessions, lead } = await startAlice()
  sessions.session.emit({ kind: "execution_settled", aborted: false })
  expect(lead.deliveries[0]).toContain("sem texto de resposta")
}

function register(): void {
  test("avisa resposta final", finished)
  test("avisa falha", failure)
  test("avisa interrupção", interrupted)
  test("aviso sem resposta", noAnswer)
}

describe("lead-notices", register)
