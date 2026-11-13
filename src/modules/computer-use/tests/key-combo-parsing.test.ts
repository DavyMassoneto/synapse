import { describe, expect, test } from "vitest"
import { computerParseKeyCombo } from "../internal"

function macAliases(): void {
  expect(computerParseKeyCombo("command-alt-s", "darwin")).toEqual({
    kind: "key-parsed",
    key: "s",
    modifiers: ["cmd", "option"],
  })
}

function windowsModifier(): void {
  expect(computerParseKeyCombo("win+r", "win32")).toEqual({ kind: "key-parsed", key: "r", modifiers: ["win"] })
}

function linuxModifier(): void {
  expect(computerParseKeyCombo("super+meta+alt+r", "linux")).toEqual({
    kind: "key-parsed",
    key: "r",
    modifiers: ["super", "meta", "alt"],
  })
}

function windowsAlias(): void {
  expect(computerParseKeyCombo("windows+r", "win32")).toEqual({ kind: "key-parsed", key: "r", modifiers: ["win"] })
}

function missingKey(): void {
  expect(computerParseKeyCombo("cmd+shift", "darwin").kind).toBe("key-missing")
}

function emptyCombo(): void {
  expect(computerParseKeyCombo(" + - ", "linux").kind).toBe("key-missing")
}

function multipleKeys(): void {
  expect(computerParseKeyCombo("a+b", "linux").kind).toBe("key-missing")
}

function register(): void {
  test("recusa duas teclas", multipleKeys)
  test("normaliza aliases no macOS", macAliases)
  test("mantém win no Windows", windowsModifier)
  test("mantém super e meta no Linux", linuxModifier)
  test("normaliza windows", windowsAlias)
  test("recusa combinação sem tecla", missingKey)
  test("ignora partes vazias", emptyCombo)
}

describe("combinações por plataforma", register)
