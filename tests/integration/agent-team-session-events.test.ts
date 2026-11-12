import { describe, expect, test } from "vitest"
import { PiTeamSessionAdapter } from "#synapse/integration"
import { failedAssistantMessage, subscribedTeamSession, TeamSessionDouble } from "../fixtures"

function translatesStart(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "agent_start" })
  expect(session.events).toEqual([{ kind: "execution_started" }])
}

function translatesTurn(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "turn_start" })
  expect(session.events).toEqual([{ kind: "turn_started" }])
}

function translatesSettled(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "agent_settled", aborted: false })
  expect(session.events).toEqual([{ kind: "execution_settled", aborted: false, answer: "resposta" }])
}

function translatesAborted(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "agent_settled", aborted: true })
  expect(session.events).toEqual([{ kind: "execution_settled", aborted: true, answer: "resposta" }])
}

function translatesToolStart(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "tool_execution_start", toolCallId: "call", toolName: "read", args: { path: "source.ts" } })
  expect(session.events).toEqual([{ kind: "tool_started", callId: "call", label: "read: source.ts" }])
}

function translatesToolEnd(): void {
  const session = subscribedTeamSession()
  session.emit({
    type: "tool_execution_end",
    toolCallId: "call",
    toolName: "read",
    result: { content: [] },
    isError: false,
  })
  expect(session.events).toEqual([{ kind: "tool_ended", callId: "call" }])
}

function translatesAssistantFailure(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "message_end", message: failedAssistantMessage("falha explícita") })
  expect(session.events).toContainEqual(
    expect.objectContaining({ kind: "assistant_response", failure: "falha explícita" }),
  )
}

function ignoresNonAssistantMessage(): void {
  const session = subscribedTeamSession()
  session.emit({ type: "message_end", message: { role: "user", content: "texto", timestamp: 0 } })
  expect(session.events).toHaveLength(0)
}

function translatesFailureWithoutMessage(): void {
  const session = subscribedTeamSession()
  const message = failedAssistantMessage("falha")
  delete message.errorMessage
  session.emit({ type: "message_end", message })
  expect(session.events).toContainEqual(
    expect.objectContaining({ kind: "assistant_response", failure: expect.stringContaining("sem informar a causa") }),
  )
}

function removesListener(): void {
  const session = new TeamSessionDouble()
  const adapter = new PiTeamSessionAdapter(session)
  const unsubscribe = adapter.subscribe(session.collect.bind(session))
  unsubscribe()
  session.emit({ type: "agent_start" })
  expect(session.events).toHaveLength(0)
}

function registerTests(): void {
  test("traduz início da execução", translatesStart)
  test("traduz início do turno", translatesTurn)
  test("traduz conclusão com resposta", translatesSettled)
  test("traduz cancelamento", translatesAborted)
  test("traduz ferramenta iniciada com alvo", translatesToolStart)
  test("traduz ferramenta encerrada", translatesToolEnd)
  test("erro com mensagem preserva a causa", translatesAssistantFailure)
  test("mensagem de usuário não vira resposta do membro", ignoresNonAssistantMessage)
  test("erro sem mensagem continua sendo falha", translatesFailureWithoutMessage)
  test("remove a assinatura de eventos", removesListener)
}

describe("eventos da sessão de membro", registerTests)
