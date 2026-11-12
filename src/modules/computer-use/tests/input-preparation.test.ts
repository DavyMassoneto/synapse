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

function register(): void {
  test("elemento de índice 0 é alvo por elemento", elementZero)
  test("set_value aponta o elemento", elementTargetForSetValue)
  test("coordenada é alvo por coordenada", coordinateTarget)
  test("digitação não tem alvo", typedWithoutTarget)
}

describe("preparação da entrada", register)
