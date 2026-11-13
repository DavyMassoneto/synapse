import { describe, expect, test } from "vitest"
import { availableMemberModels, selectMemberModel } from "#synapse/integration"
import { fixtureModel, type MemberModelSut, ToolsModelRegistry } from "../fixtures"

function makeSut(): MemberModelSut {
  const model = fixtureModel("provider", "model", 100000)
  const registry = new ToolsModelRegistry(model)
  return {
    registry,
    context: { cwd: process.cwd(), model, thinkingLevel: "high", modelRegistry: registry },
  }
}

function inheritLead(): void {
  const sut = makeSut()
  expect(selectMemberModel(sut.context, {})).toEqual({
    model: sut.context.model,
    thinkingLevel: "high",
  })
}

function explicitSelection(): void {
  const sut = makeSut()
  expect(selectMemberModel(sut.context, { model: "provider/model", thinking: "low" }).thinkingLevel).toBe("low")
}

function rejectMissingModel(): void {
  const sut = makeSut()
  expect(selectMissing.bind(null, sut)).toThrow("Modelos disponíveis: provider/model")
}

function selectMissing(sut: MemberModelSut): void {
  selectMemberModel(sut.context, { model: "provider/missing" })
}

function rejectLevel(): void {
  const sut = makeSut()
  expect(selectUnsupported.bind(null, sut)).toThrow(/Níveis disponíveis:.*high/)
}

function selectUnsupported(sut: MemberModelSut): void {
  selectMemberModel(sut.context, { thinking: "invalid" })
}

function rejectUnauthorized(): void {
  const sut = makeSut()
  sut.registry.authorized = false
  expect(availableMemberModels(sut.context)).toEqual([])
  expect(selectUnauthorized.bind(null, sut)).toThrow("Modelo indisponível")
}

function selectUnauthorized(sut: MemberModelSut): void {
  selectMemberModel(sut.context, { model: "provider/model" })
}

function listModels(): void {
  const sut = makeSut()
  expect(availableMemberModels(sut.context)).toMatchObject([
    { reference: "provider/model", thinkingLevels: expect.arrayContaining(["high"]) },
  ])
}

function registerTests(): void {
  test("herda modelo e nível do lead", inheritLead)
  test("aceita seleção explícita", explicitSelection)
  test("recusa modelo inexistente com catálogo", rejectMissingModel)
  test("recusa nível inválido com níveis aceitos", rejectLevel)
  test("omite e recusa modelo sem credencial", rejectUnauthorized)
  test("lista referências e níveis", listModels)
}

describe("seleção de modelo dos membros", registerTests)
