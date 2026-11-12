import { describe, expect, test } from "vitest"
import { diagnoseIphone } from "#synapse/modules/iphone/internal/diagnosis"
import { TestIphoneDiagnosis } from "./doubles"

async function succeeds(): Promise<void> {
  const port = new TestIphoneDiagnosis()
  const result = await diagnoseIphone(
    {
      serverUrl: "http://localhost:4723",
      target: { kind: "device", udid: "abc", deviceName: "fake", wdaInstalled: true },
    },
    "darwin",
    port,
    new AbortController().signal,
  )
  expect(result).toMatchObject({
    server: { kind: "ok" },
    target: { kind: "ok" },
    simulator: { kind: "not-applicable" },
  })
}

async function fails(): Promise<void> {
  const port = new TestIphoneDiagnosis()
  port.responds = false
  const result = await diagnoseIphone(
    {
      serverUrl: "http://localhost:4723",
      target: { kind: "device", udid: "", deviceName: "fake", wdaInstalled: true },
    },
    "darwin",
    port,
    new AbortController().signal,
  )
  expect(result).toMatchObject({
    server: { kind: "failed" },
    target: { kind: "failed", message: expect.stringContaining("udid") },
  })
}

function suite(): void {
  test("diagnostica servidor e aparelho", succeeds)
  test("aponta falhas", fails)
}

describe("diagnóstico iPhone", suite)
