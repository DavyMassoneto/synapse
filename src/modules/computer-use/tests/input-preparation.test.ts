import { describe, expect, test } from "vitest"
import { COMPUTER_PREPARED_TARGET_ELEMENT, computerPrepareInput } from "../internal"

function elementZero(): void {
  expect(computerPrepareInput({ action: "click", element: 0 }, "darwin").target).toStrictEqual({
    kind: COMPUTER_PREPARED_TARGET_ELEMENT,
    index: 0,
  })
}

function elementTargetForSetValue(): void {
  expect(computerPrepareInput({ action: "set_value", element: 3, value: "x" }, "darwin").target).toStrictEqual({
    kind: COMPUTER_PREPARED_TARGET_ELEMENT,
    index: 3,
  })
}

function coordinateTarget(): void {
  expect(computerPrepareInput({ action: "click", coordinate: { x: 10, y: 20 } }, "darwin").target).toStrictEqual({
    kind: "prepared-target-coordinate",
    x: 10,
    y: 20,
  })
}

function typedWithoutTarget(): void {
  expect(computerPrepareInput({ action: "type", text: "oi" }, "darwin").target).toStrictEqual({
    kind: "prepared-target-absent",
  })
}

function scrollElementPrecedence(): void {
  const prepared = computerPrepareInput({ action: "scroll", element: 0, coordinate: { x: 4, y: 5 } }, "darwin")
  expect(prepared.target).toEqual({ kind: "prepared-target-element", index: 0 })
  expect(prepared.arguments).not.toHaveProperty("x")
}

function clickElementPrecedence(): void {
  const prepared = computerPrepareInput({ action: "click", element: 0, coordinate: { x: 4, y: 5 } }, "darwin")
  expect(prepared.target).toEqual({ kind: "prepared-target-element", index: 0 })
  expect(prepared.arguments).not.toHaveProperty("x")
}

function scrollCoordinateZero(): void {
  expect(computerPrepareInput({ action: "scroll", coordinate: { x: 0, y: 0 } }, "darwin").target).toEqual({
    kind: "prepared-target-coordinate",
    x: 0,
    y: 0,
  })
}

function scrollWithoutTarget(): void {
  expect(computerPrepareInput({ action: "scroll" }, "darwin").target).toEqual({ kind: "prepared-target-absent" })
}

function clickWithoutTarget(): void {
  expect(computerPrepareInput.bind(undefined, { action: "click" }, "darwin")).toThrow()
}

function clickDynamicButton(): void {
  expect(computerPrepareInput({ action: "click", element: 1, button: "middle" }, "darwin")).toMatchObject({
    tool: "click",
    arguments: { button: "middle" },
  })
}

function doubleDynamicButton(): void {
  expect(computerPrepareInput({ action: "double_click", element: 1, button: "right" }, "darwin")).toMatchObject({
    tool: "double_click",
    arguments: { button: "right" },
  })
}

function rightForcedButton(): void {
  expect(computerPrepareInput({ action: "right_click", element: 1, button: "left" }, "darwin")).toMatchObject({
    tool: "click",
    arguments: { button: "right" },
  })
}

function middleForcedButton(): void {
  expect(computerPrepareInput({ action: "middle_click", element: 1, button: "right" }, "darwin")).toMatchObject({
    tool: "click",
    arguments: { button: "middle" },
  })
}

function register(): void {
  test("scroll prioriza elemento zero", scrollElementPrecedence)
  test("click prioriza elemento zero", clickElementPrecedence)
  test("scroll preserva coordenadas zero", scrollCoordinateZero)
  test("scroll aceita ausência de alvo", scrollWithoutTarget)
  test("click recusa ausência de alvo", clickWithoutTarget)
  test("click mantém botão solicitado", clickDynamicButton)
  test("double mantém botão solicitado", doubleDynamicButton)
  test("right força botão direito", rightForcedButton)
  test("middle força botão central", middleForcedButton)
  test("elemento de índice 0 é alvo por elemento", elementZero)
  test("set_value aponta o elemento", elementTargetForSetValue)
  test("coordenada é alvo por coordenada", coordinateTarget)
  test("digitação não tem alvo", typedWithoutTarget)
}

describe("preparação da entrada", register)
