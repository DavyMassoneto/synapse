import { describe, expect, test } from "vitest"
import { createTaskOutcome, createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"

function parentScope(): void {
  const { board } = makeTaskBoardSut()
  expect(createTaskOutcome(board, [], ["../x"])).toBe("refused")
}

function absoluteScope(): void {
  const { board } = makeTaskBoardSut()
  expect(createTaskOutcome(board, [], ["/x"])).toBe("refused")
}

function normalScope(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], ["./src/a/"])
  expect(board.list({})[0]?.writeScopes).toEqual(["src/a"])
}

function overlap(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], ["src/a"])
  createTestTask(board, [], ["src/a/b"])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  expect(board.list({ status: "pending" })[0]?.writeScopeWarnings).toHaveLength(1)
}

function windowsScope(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], ["src\\a"])
  expect(board.list({})[0]?.writeScopes).toEqual(["src/a"])
}

function driveScope(): void {
  const { board } = makeTaskBoardSut()
  expect(createTaskOutcome(board, [], ["C:\\x"])).toBe("refused")
}

function register(): void {
  test("escopo ascendente", parentScope)
  test("escopo absoluto", absoluteScope)
  test("normalização de escopo", normalScope)
  test("aviso de sobreposição", overlap)
  test("normaliza escopo Windows", windowsScope)
  test("recusa unidade Windows", driveScope)
}

describe("board-scopes", register)
