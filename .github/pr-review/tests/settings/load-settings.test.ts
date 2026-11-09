import { afterEach, expect, test, vi } from "vitest"
import { loadSettings, readEnv } from "#synapse/settings"

afterEach(() => {
  vi.unstubAllEnvs()
})

function validEnvironment(): void {
  vi.stubEnv("REPO", "owner/repo")
  vi.stubEnv("PR_NUMBER", "8")
  vi.stubEnv("BASE_SHA", "a".repeat(40))
  vi.stubEnv("HEAD_SHA", "b".repeat(40))
  vi.stubEnv("OMNIROUTE_BASE_URL", "https://example.com")
  vi.stubEnv("OMNIROUTE_API_KEY", "test")
  vi.stubEnv("REVIEW_MODEL", "model")
  vi.stubEnv("PR_TITLE", "title")
  vi.stubEnv("PR_BODY", "")
}

test("rejects missing environment and returns defined values", () => {
  vi.stubEnv("REVIEW_MODEL", undefined)
  expect(() => readEnv("REVIEW_MODEL")).toThrow("Variável de ambiente ausente: REVIEW_MODEL")
  vi.stubEnv("REVIEW_MODEL", "model")
  expect(readEnv("REVIEW_MODEL")).toBe("model")
})

test("validates settings at the environment boundary", () => {
  validEnvironment()
  expect(loadSettings().prNumber).toBe("8")
  vi.stubEnv("PR_NUMBER", "abc")
  expect(() => loadSettings()).toThrow(/^Configuração inválida: PR_NUMBER$/)
})

test("rejects malformed commit references", () => {
  validEnvironment()
  vi.stubEnv("BASE_SHA", "base")
  expect(() => loadSettings()).toThrow(/^Configuração inválida: BASE_SHA$/)
  validEnvironment()
  vi.stubEnv("HEAD_SHA", "head")
  expect(() => loadSettings()).toThrow(/^Configuração inválida: HEAD_SHA$/)
})
