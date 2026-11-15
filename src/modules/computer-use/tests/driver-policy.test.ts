import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
  COMPUTER_DRIVER_POLICY_MODE_PINNED,
  COMPUTER_DRIVER_POLICY_SCHEMA,
} from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_RELEASE_TEST_REASON } from "./driver-release-constants"

function latestStableAccepted(): void {
  expect(Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, { mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE })).toBe(true)
}

function pinnedAccepted(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.21.0",
      reason: COMPUTER_DRIVER_RELEASE_TEST_REASON,
    }),
  ).toBe(true)
}

function emptyReasonRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.21.0",
      reason: "",
    }),
  ).toBe(false)
}

function whitespaceReasonRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.21.0",
      reason: "   ",
    }),
  ).toBe(false)
}

function missingReasonRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.21.0",
    }),
  ).toBe(false)
}

function versionRangeRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: ">=0.21.0",
      reason: COMPUTER_DRIVER_RELEASE_TEST_REASON,
    }),
  ).toBe(false)
}

function prereleaseVersionRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.51.0-rc.1",
      reason: COMPUTER_DRIVER_RELEASE_TEST_REASON,
    }),
  ).toBe(false)
}

function nightlyVersionRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_PINNED,
      version: "0.51.0-nightly.20260101",
      reason: COMPUTER_DRIVER_RELEASE_TEST_REASON,
    }),
  ).toBe(false)
}

function unknownModeRejected(): void {
  expect(Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, { mode: "frozen" })).toBe(false)
}

function additionalPropertyRejected(): void {
  expect(
    Value.Check(COMPUTER_DRIVER_POLICY_SCHEMA, {
      mode: COMPUTER_DRIVER_POLICY_MODE_LATEST_STABLE,
      version: "0.21.0",
    }),
  ).toBe(false)
}

describe("política de release do driver", () => {
  test("aceita latest-stable", latestStableAccepted)
  test("aceita pinagem com versão exata e motivo", pinnedAccepted)
  test("recusa motivo vazio", emptyReasonRejected)
  test("recusa motivo com apenas espaços", whitespaceReasonRejected)
  test("recusa pinagem sem motivo", missingReasonRejected)
  test("recusa faixa de versão", versionRangeRejected)
  test("recusa versão pré-release", prereleaseVersionRejected)
  test("recusa versão nightly", nightlyVersionRejected)
  test("recusa modo desconhecido", unknownModeRejected)
  test("recusa propriedade não prevista", additionalPropertyRejected)
})
