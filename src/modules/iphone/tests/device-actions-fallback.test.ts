import { describe, expect, test } from "vitest"
import { executeIphoneDeviceAction } from "#synapse/modules/iphone/internal/device-actions"
import { DeviceActionsError } from "./device-actions-error"
import { DeviceActionsPort } from "./device-actions-port"

function makeSut(): DeviceActionsPort {
  return new DeviceActionsPort()
}

async function unsupportedType(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("unsupported operation")
  await executeIphoneDeviceAction(port, { kind: "type", text: "abc", submit: false }, new AbortController().signal)
  expect(port.calls).toEqual(["keys", "activeElement", "elementValue"])
}

async function uncertainType(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("timeout")
  await expect(
    executeIphoneDeviceAction(port, { kind: "type", text: "abc", submit: false }, new AbortController().signal),
  ).rejects.toThrow("timeout")
  expect(port.calls).toEqual(["keys"])
}

async function unsupportedUrl(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("unknown command")
  await executeIphoneDeviceAction(
    port,
    { kind: "url", url: "https://example.com", bundleId: "browser" },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["deepLink", "openUrl"])
}

async function uncertainUrl(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("timeout")
  await expect(
    executeIphoneDeviceAction(
      port,
      { kind: "url", url: "https://example.com", bundleId: "browser" },
      new AbortController().signal,
    ),
  ).rejects.toThrow("timeout")
  expect(port.calls).toEqual(["deepLink"])
}

async function unsupportedScroll(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("unsupported operation")
  port.failureScript = "scroll"
  await executeIphoneDeviceAction(
    port,
    { kind: "scroll", direction: "down", point: { x: 50, y: 50 } },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["scroll", "rect", "dragFromToForDuration"])
}

async function uncertainScroll(): Promise<void> {
  const port = makeSut()
  port.failure = new DeviceActionsError("timeout")
  await expect(
    executeIphoneDeviceAction(
      port,
      { kind: "scroll", direction: "down", point: { x: 50, y: 50 } },
      new AbortController().signal,
    ),
  ).rejects.toThrow("timeout")
  expect(port.calls).toEqual(["scroll"])
}

async function invalidWait(): Promise<void> {
  const port = makeSut()
  await expect(
    executeIphoneDeviceAction(port, { kind: "wait", seconds: NaN }, new AbortController().signal),
  ).rejects.toThrow()
  expect(port.calls).toEqual([])
}

async function invalidBundle(): Promise<void> {
  const port = makeSut()
  await expect(
    executeIphoneDeviceAction(port, { kind: "launch", bundleId: "" }, new AbortController().signal),
  ).rejects.toThrow()
  expect(port.calls).toEqual([])
}

async function invalidUrl(): Promise<void> {
  const port = makeSut()
  await expect(
    executeIphoneDeviceAction(port, { kind: "url", url: "invalid", bundleId: "browser" }, new AbortController().signal),
  ).rejects.toThrow()
  expect(port.calls).toEqual([])
}

function suite(): void {
  test("digitação sem suporte usa elemento ativo", unsupportedType)
  test("digitação incerta não repete", uncertainType)
  test("URL sem comando usa endpoint W3C", unsupportedUrl)
  test("URL incerta não repete", uncertainUrl)
  test("scroll sem suporte tenta gesto uma vez", unsupportedScroll)
  test("scroll incerto não repete", uncertainScroll)
  test("recusa espera inválida", invalidWait)
  test("recusa bundle vazio", invalidBundle)
  test("recusa URL inválida", invalidUrl)
}

describe("alternativas seguras iPhone", suite)
