import { describe, expect, test } from "vitest"
import { resolveIphoneTarget } from "#synapse/modules/iphone/internal/device-actions"
import { iphoneElementCenter } from "../internal"
import { IPHONE_TEST_MISSING_CENTER_TARGET, IPHONE_TEST_NEGATIVE_CENTER, IPHONE_TEST_ROUNDED_CENTER } from "./constants"

function roundsRectCenter(): void {
  expect(iphoneElementCenter({ x: 10, y: 20, width: 5, height: 7 })).toEqual(IPHONE_TEST_ROUNDED_CENTER)
}

function preservesNegativeCoordinates(): void {
  expect(iphoneElementCenter({ x: -8, y: -4, width: 3, height: 3 })).toEqual(IPHONE_TEST_NEGATIVE_CENTER)
}

function refusesMissingElement(): void {
  expect(resolveIphoneTarget.bind(undefined, IPHONE_TEST_MISSING_CENTER_TARGET, [])).toThrow()
}

function suite(): void {
  test("centro mantém arredondamento do retângulo", roundsRectCenter)
  test("centro preserva coordenadas negativas", preservesNegativeCoordinates)
  test("alvo de elemento ausente é recusado", refusesMissingElement)
}

describe("geometria dos elementos", suite)
