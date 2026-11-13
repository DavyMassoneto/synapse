import { describe, expect, test } from "vitest"
import { executeIphoneDeviceAction } from "#synapse/modules/iphone/internal/device-actions"
import { DeviceActionsPort } from "./device-actions-port"

function makeSut(): DeviceActionsPort {
  return new DeviceActionsPort()
}

async function tree(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "tree", max: 200 }, new AbortController().signal)
  expect(port.calls).toEqual(["source", "rect"])
}

async function screenshot(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "screenshot" }, new AbortController().signal)
  expect(port.calls).toEqual(["screenshot"])
}

async function tap(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "tap", point: { x: 10, y: 20 } }, new AbortController().signal)
  expect(port.calls).toEqual(["actions"])
}

async function doubleTap(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "double_tap", point: { x: 10, y: 20 } }, new AbortController().signal)
  expect(port.calls).toEqual(["doubleTap"])
}

async function longPress(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    { kind: "long_press", point: { x: 10, y: 20 }, durationMs: 1000 },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["actions"])
}

async function typeText(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "type", text: "abc", submit: true }, new AbortController().signal)
  expect(port.calls).toEqual(["keys", "keys"])
}

async function clear(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "clear", point: { x: 10, y: 20 } }, new AbortController().signal)
  expect(port.calls).toEqual(["actions", "activeElement", "clearElement"])
}

async function swipe(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "swipe", direction: "up" }, new AbortController().signal)
  expect(port.calls).toEqual(["rect", "dragFromToForDuration"])
}

async function scroll(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    { kind: "scroll", direction: "down", point: { x: 10, y: 20 } },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["scroll"])
}

async function launch(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "launch", bundleId: "com.example.app" }, new AbortController().signal)
  expect(port.calls).toEqual(["launchApp"])
}

async function terminate(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    { kind: "terminate", bundleId: "com.example.app" },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["terminateApp"])
}

async function activate(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "activate", bundleId: "com.example.app" }, new AbortController().signal)
  expect(port.calls).toEqual(["activateApp"])
}

async function install(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "install", path: "app.ipa" }, new AbortController().signal)
  expect(port.calls).toEqual(["installApp"])
}

async function home(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "home" }, new AbortController().signal)
  expect(port.calls).toEqual(["pressButton"])
}

async function press(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "press", button: "volumeup" }, new AbortController().signal)
  expect(port.calls).toEqual(["pressButton"])
}

async function alert(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    { kind: "alert", action: "accept", buttonLabel: "OK" },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["alert"])
}

async function url(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    { kind: "url", url: "https://example.com", bundleId: "com.apple.mobilesafari" },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["deepLink"])
}

async function info(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "info" }, new AbortController().signal)
  expect(port.calls).toEqual(["deviceInfo", "activeAppInfo", "rect"])
}

async function wait(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "wait", seconds: 60 }, new AbortController().signal)
  expect(port.calls).toEqual(["wait:30000"])
}

async function orientation(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "orientation", orientation: "LANDSCAPE" }, new AbortController().signal)
  expect(port.calls).toEqual(["setOrientation", "getOrientation"])
}

async function close(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(port, { kind: "close" }, new AbortController().signal)
  expect(port.calls).toEqual(["close"])
}

async function drag(): Promise<void> {
  const port = makeSut()
  await executeIphoneDeviceAction(
    port,
    {
      kind: "drag",
      drag: {
        from: { x: 10, y: 20 },
        destination: { x: 80, y: 90 },
        holdMs: 1000,
        liftDistance: 14,
        liftMs: 250,
        moveMs: 30,
        hoverMs: 800,
      },
    },
    new AbortController().signal,
  )
  expect(port.calls).toEqual(["actions"])
}

async function rejectsTap(): Promise<void> {
  const port = makeSut()
  await expect(
    executeIphoneDeviceAction(port, { kind: "tap", point: { x: -1, y: 8 } }, new AbortController().signal),
  ).rejects.toThrow()
  expect(port.calls).toEqual([])
}

function suite(): void {
  test("executa tree", tree)
  test("executa screenshot", screenshot)
  test("executa tap", tap)
  test("executa doubleTap", doubleTap)
  test("executa longPress", longPress)
  test("executa typeText", typeText)
  test("executa clear", clear)
  test("executa swipe", swipe)
  test("executa scroll", scroll)
  test("executa launch", launch)
  test("executa terminate", terminate)
  test("executa activate", activate)
  test("executa install", install)
  test("executa home", home)
  test("executa press", press)
  test("executa alert", alert)
  test("executa url", url)
  test("executa info", info)
  test("executa wait", wait)
  test("executa orientation", orientation)
  test("executa close", close)
  test("executa drag", drag)
  test("recusa ponto inválido sem efeito", rejectsTap)
}

describe("ações iPhone", suite)
