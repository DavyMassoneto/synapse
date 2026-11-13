import { describe, expect, test } from "vitest"
import { createModelRouter } from "../public"
import {
  ROUTER_TEST_CREDENTIAL_MASK,
  ROUTER_TEST_CREDENTIAL_TEXT,
  ROUTER_TEST_DUPLICATE_CHOICE,
  ROUTER_TEST_LESSER_CHOICE,
  ROUTER_TEST_PRIVATE_KEY_MASK,
  ROUTER_TEST_RANGE_CHOICE,
  ROUTER_TEST_REQUEST,
  ROUTER_TEST_SELECTED,
  ROUTER_TEST_SUM_CHOICE,
  ROUTER_TEST_UNAVAILABLE,
  ROUTER_TEST_UNREDACTED_CREDENTIALS,
  ROUTER_TEST_USER_ROLE,
  RouterTestClassifier,
} from "./doubles"
import { type RouterSelectionSut } from "./types"

function makeSut(): RouterSelectionSut {
  const classifier = new RouterTestClassifier()
  return { classifier, router: createModelRouter(classifier), request: structuredClone(ROUTER_TEST_REQUEST) }
}

async function acceptsValidChoice(): Promise<void> {
  const sut = makeSut()
  expect(await sut.router.route(sut.request)).toMatchObject(ROUTER_TEST_SELECTED)
}

async function rejectsDuplicateProbability(): Promise<void> {
  const sut = makeSut()
  sut.classifier.outcome = ROUTER_TEST_DUPLICATE_CHOICE
  expect(await sut.router.route(sut.request)).toMatchObject(ROUTER_TEST_UNAVAILABLE)
}

async function rejectsProbabilityRange(): Promise<void> {
  const sut = makeSut()
  sut.classifier.outcome = ROUTER_TEST_RANGE_CHOICE
  expect(await sut.router.route(sut.request)).toMatchObject(ROUTER_TEST_UNAVAILABLE)
}

async function rejectsProbabilitySum(): Promise<void> {
  const sut = makeSut()
  sut.classifier.outcome = ROUTER_TEST_SUM_CHOICE
  expect(await sut.router.route(sut.request)).toMatchObject(ROUTER_TEST_UNAVAILABLE)
}

async function rejectsLesserChoice(): Promise<void> {
  const sut = makeSut()
  sut.classifier.outcome = ROUTER_TEST_LESSER_CHOICE
  expect(await sut.router.route(sut.request)).toMatchObject(ROUTER_TEST_UNAVAILABLE)
}

async function redactsCredentialsBeforeClassification(): Promise<void> {
  const sut = makeSut()
  sut.request.messages = [
    {
      ...ROUTER_TEST_REQUEST.messages[0],
      role: ROUTER_TEST_USER_ROLE,
      image: false,
      calls: [],
      text: ROUTER_TEST_CREDENTIAL_TEXT,
    },
  ]
  await sut.router.route(sut.request)
  const text = sut.classifier.requireRequest().state.conversation.currentRequest
  expect(text).not.toMatch(ROUTER_TEST_UNREDACTED_CREDENTIALS)
  expect(text).toContain(ROUTER_TEST_CREDENTIAL_MASK)
  expect(text).toContain(ROUTER_TEST_PRIVATE_KEY_MASK)
}

function registerTests(): void {
  test("aplica distribuição válida", acceptsValidChoice)
  test("recusa opção repetida na distribuição", rejectsDuplicateProbability)
  test("recusa probabilidade fora do intervalo", rejectsProbabilityRange)
  test("recusa probabilidades cuja soma diverge de um", rejectsProbabilitySum)
  test("recusa escolha de menor probabilidade", rejectsLesserChoice)
  test("remove credenciais antes de enviar ao classificador", redactsCredentialsBeforeClassification)
}

describe("seleção isolada do model-router", registerTests)
