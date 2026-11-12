import { describe, expect, test } from "vitest"
import { computerReadImageDimensions } from "../adapters"
import { computerTestJpeg, computerTestPng } from "./support"

function png(): void {
  expect(computerReadImageDimensions(computerTestPng())).toEqual({ kind: "dimensions-found", width: 512, height: 256 })
}

function jpeg(): void {
  expect(computerReadImageDimensions(computerTestJpeg())).toEqual({ kind: "dimensions-found", width: 512, height: 256 })
}

function truncatedPng(): void {
  expect(computerReadImageDimensions(computerTestPng().slice(0, 20)).kind).toBe("dimensions-absent")
}

function truncatedJpeg(): void {
  expect(computerReadImageDimensions(computerTestJpeg().slice(0, 16)).kind).toBe("dimensions-absent")
}

function invalidPng(): void {
  const bytes = computerTestPng()
  bytes[4] = 0
  expect(computerReadImageDimensions(bytes).kind).toBe("dimensions-absent")
}

function empty(): void {
  expect(computerReadImageDimensions(new Uint8Array()).kind).toBe("dimensions-absent")
}

function register(): void {
  test("lê PNG", png)
  test("lê JPEG com segmento anterior", jpeg)
  test("recusa PNG truncado", truncatedPng)
  test("recusa JPEG truncado", truncatedJpeg)
  test("recusa assinatura PNG parcial", invalidPng)
  test("recusa bytes vazios", empty)
}

describe("dimensões da imagem", register)
