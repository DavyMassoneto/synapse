import { describe, expect, test } from "vitest"
import { createModelRouter } from "../public"
import {
  ROUTER_UNIT_ABORT,
  ROUTER_UNIT_CHOICE,
  ROUTER_UNIT_FIRST,
  ROUTER_UNIT_HIGH,
  ROUTER_UNIT_LOW,
  ROUTER_UNIT_OUTSIDE,
  ROUTER_UNIT_SECOND,
  ROUTER_UNIT_USER,
} from "./constants"
import { RouterClassifierDouble, routerTestCandidate } from "./doubles"
import { type RouterTestSut } from "./types"

function makeSut(): RouterTestSut {
  const classifier = new RouterClassifierDouble()

  classifier.outcomes = [
    {
      kind: ROUTER_UNIT_CHOICE,
      choice: ROUTER_UNIT_SECOND,
      probabilities: [
        { option: ROUTER_UNIT_FIRST, probability: 0.2 },
        { option: ROUTER_UNIT_SECOND, probability: 0.8 },
      ],
    },
    {
      kind: ROUTER_UNIT_CHOICE,
      choice: ROUTER_UNIT_HIGH,
      probabilities: [
        { option: ROUTER_UNIT_LOW, probability: 0.1 },
        { option: ROUTER_UNIT_HIGH, probability: 0.9 },
      ],
    },
  ]
  return {
    router: createModelRouter(classifier),
    classifier,
    request: {
      messages: [{ role: ROUTER_UNIT_USER, text: "Resolva a investigação", image: false, calls: [] }],
      candidates: [routerTestCandidate(ROUTER_UNIT_FIRST), routerTestCandidate(ROUTER_UNIT_SECOND)],
    },
  }
}

async function selectBoth(): Promise<void> {
  const sut = makeSut()
  const result = await sut.router.route(sut.request)
  expect(result).toMatchObject({ kind: "selected", modelId: "second", effort: "high" })

  expect(sut.classifier.requests.map((request) => request.question.name)).toEqual(["model", "effort"])
  expect(sut.classifier.requests[1]?.state.selectedModel).toContain("second")
}

async function skipSingleModel(): Promise<void> {
  const sut = makeSut()

  sut.request.candidates = sut.request.candidates.slice(1)
  sut.classifier.outcomes.shift()
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "selected", effort: "high" })

  expect(sut.classifier.requests.map((request) => request.question.name)).toEqual(["effort"])
}

async function skipSingleEffort(): Promise<void> {
  const sut = makeSut()
  for (const candidate of sut.request.candidates) {
    candidate.efforts = [ROUTER_UNIT_LOW]
  }
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "selected", effort: "low" })
  expect(sut.classifier.requests).toHaveLength(1)
}

async function rejectOutsideOption(): Promise<void> {
  const sut = makeSut()

  sut.classifier.outcomes = [
    {
      kind: ROUTER_UNIT_CHOICE,
      choice: ROUTER_UNIT_OUTSIDE,
      probabilities: [{ option: ROUTER_UNIT_OUTSIDE, probability: 1 }],
    },
  ]
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "unavailable" })
}

async function rejectBadSum(): Promise<void> {
  const sut = makeSut()

  sut.classifier.outcomes = [
    {
      kind: ROUTER_UNIT_CHOICE,
      choice: ROUTER_UNIT_SECOND,
      probabilities: [
        { option: ROUTER_UNIT_FIRST, probability: 0.2 },
        { option: ROUTER_UNIT_SECOND, probability: 0.5 },
      ],
    },
  ]
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "unavailable" })
}

async function rejectLesserChoice(): Promise<void> {
  const sut = makeSut()

  sut.classifier.outcomes = [
    {
      kind: ROUTER_UNIT_CHOICE,
      choice: ROUTER_UNIT_FIRST,
      probabilities: [
        { option: ROUTER_UNIT_FIRST, probability: 0.2 },
        { option: ROUTER_UNIT_SECOND, probability: 0.8 },
      ],
    },
  ]
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "unavailable" })
}

async function classifierFailure(): Promise<void> {
  const sut = makeSut()

  sut.classifier.failure = new Error("falha técnica")
  expect(await sut.router.route(sut.request)).toMatchObject({ kind: "unavailable" })
}

async function propagateAbort(): Promise<void> {
  const sut = makeSut()

  sut.classifier.failure = new DOMException("cancelado", ROUTER_UNIT_ABORT)
  expect(await sut.router.route(sut.request)).toEqual({ kind: "cancelled" })
}

async function rejectAbortedSignal(): Promise<void> {
  const sut = makeSut()

  sut.request.signal = AbortSignal.abort()
  expect(await sut.router.route(sut.request)).toEqual({ kind: "cancelled" })
  expect(sut.classifier.requests).toHaveLength(0)
}

async function cancelledClassifierOutcome(): Promise<void> {
  const sut = makeSut()
  sut.classifier.outcomes = [{ kind: "cancelled" }]
  expect(await sut.router.route(sut.request)).toEqual({ kind: "cancelled" })
}

function registerTests(): void {
  test("seleciona modelo e depois esforço", selectBoth)
  test("não classifica modelo único", skipSingleModel)
  test("não classifica esforço único", skipSingleEffort)
  test("recusa opção fora da lista", rejectOutsideOption)
  test("recusa soma de probabilidades inválida", rejectBadSum)
  test("recusa escolha abaixo da maior probabilidade", rejectLesserChoice)
  test("falha do classificador resulta em failed", classifierFailure)
  test("resultado cancelado do classificador cancela rota", cancelledClassifierOutcome)
  test("cancelamento do classificador propaga", propagateAbort)
  test("sinal cancelado recusa classificação", rejectAbortedSignal)
}

describe("seleção contextual model-router", registerTests)
