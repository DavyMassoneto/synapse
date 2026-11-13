import { describe, expect, test } from "vitest"
import { buildIphoneDrag, buildIphoneHomeDrag, buildIphoneHomePageDrag, buildIphonePageDrag } from "../internal"
import { IPHONE_REFUSED } from "../public"
import {
  IPHONE_TEST_CALIBRATED_DESTINATION,
  IPHONE_TEST_CALIBRATED_DRAG,
  IPHONE_TEST_CALIBRATED_EDGE,
  IPHONE_TEST_CALIBRATED_FROM,
  IPHONE_TEST_CALIBRATED_PAGE_DRAG,
} from "./constants"

function calibratedDragMatchesSpecification(): void {
  expect(buildIphoneHomeDrag(IPHONE_TEST_CALIBRATED_FROM, IPHONE_TEST_CALIBRATED_DESTINATION)).toEqual(
    buildIphoneDrag(IPHONE_TEST_CALIBRATED_DRAG),
  )
}

function calibratedPageMatchesSpecification(): void {
  expect(
    buildIphoneHomePageDrag(
      IPHONE_TEST_CALIBRATED_FROM,
      IPHONE_TEST_CALIBRATED_DESTINATION,
      IPHONE_TEST_CALIBRATED_EDGE,
    ),
  ).toEqual(buildIphonePageDrag(IPHONE_TEST_CALIBRATED_PAGE_DRAG))
}

function refusesCalibratedInvalidPoint(): void {
  expect(buildIphoneHomeDrag({ x: Number.NaN, y: 20 }, { x: 200, y: 200 }).kind).toBe(IPHONE_REFUSED)
}

function suite(): void {
  test("arrasto usa calibração e pontos runtime", calibratedDragMatchesSpecification)
  test("virada usa calibração e direção runtime", calibratedPageMatchesSpecification)
  test("arrasto calibrado recusa ponto inválido", refusesCalibratedInvalidPoint)
}

describe("calibração do arrasto inicial", suite)
