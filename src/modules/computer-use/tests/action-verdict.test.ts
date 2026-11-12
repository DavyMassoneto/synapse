import { describe, expect, test } from "vitest"
import { computerJudgeAction } from "../internal"

function confirmed(): void {
  const judged = computerJudgeAction({ action: "click", ok: true, message: "", effect: "confirmed" })
  expect(judged.result.kind).toBe("completed")
  expect(judged.verdict.kind).toBe("done")
}

function unconfirmed(): void {
  const judged = computerJudgeAction({
    action: "click",
    ok: true,
    message: "",
    effect: "unverifiable",
    recommended: "foreground",
  })
  expect(judged.result.kind).toBe("unconfirmed")
  expect(judged.verdict.kind).toBe("verify-fresh-state")
}

function noCharacters(): void {
  const judged = computerJudgeAction({
    action: "type",
    ok: false,
    message: "",
    code: "type_text_incomplete",
    deliveredChars: 0,
    requestedChars: 10,
  })
  expect(judged.verdict).toMatchObject({ kind: "escalate", recommended: "set_value" })
}

function noRequestedCharacters(): void {
  const judged = computerJudgeAction({
    action: "type",
    ok: false,
    message: "",
    code: "type_text_incomplete",
    deliveredChars: 0,
    requestedChars: 0,
  })
  expect(judged.verdict).not.toHaveProperty("recommended")
}

function partialCharacters(): void {
  const judged = computerJudgeAction({
    action: "type",
    ok: false,
    message: "",
    code: "type_text_incomplete",
    deliveredChars: 1,
    requestedChars: 10,
  })
  expect(judged.verdict).not.toHaveProperty("recommended")
}

function timeout(): void {
  const judged = computerJudgeAction({
    action: "click",
    ok: false,
    message: "",
    code: "timeout_outcome_unknown",
    verified: true,
  })
  expect(judged.result).toMatchObject({ kind: "outcome-unknown", retryAllowed: false })
  expect(judged.verdict).toMatchObject({ kind: "verify-fresh-state", retryAllowed: false })
}

function transportFailure(): void {
  expect(
    computerJudgeAction({ action: "click", ok: false, message: "", code: "transport_outcome_unknown" }).result,
  ).toMatchObject({ kind: "outcome-unknown", retryAllowed: false })
}

function noProof(): void {
  expect(computerJudgeAction({ action: "key", ok: true, message: "" }).verdict.kind).toBe("verify-fresh-state")
}

function escalation(): void {
  expect(
    computerJudgeAction({ action: "click", ok: true, message: "", effect: "suspected_noop", recommended: "px" })
      .verdict,
  ).toMatchObject({ kind: "escalate", recommended: "px" })
}

function register(): void {
  test("confirma efeito", confirmed)
  test("não repete efeito não verificável", unconfirmed)
  test("recomenda valor quando nada chegou", noCharacters)
  test("não recomenda valor para entrega parcial", partialCharacters)
  test("sem caracteres pedidos não escala", noRequestedCharacters)
  test("timeout prevalece sobre confirmação", timeout)
  test("falha de transporte não permite repetição", transportFailure)
  test("transporte sem prova exige captura", noProof)
  test("preserva recomendação do driver", escalation)
}

describe("veredito da ação", register)
