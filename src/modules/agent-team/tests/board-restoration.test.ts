import { describe, expect, test } from "vitest"
import { createTaskOutcome, createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"

function restoration(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  const restored = makeTaskBoardSut().board
  restored.restore(journal.snapshots)
  createTestTask(restored, [], [])
  expect(restored.get("task-2").kind).toBe("accepted")
}

function journalFailure(): void {
  const { board, journal } = makeTaskBoardSut()
  journal.fail = true
  expect(createTaskOutcome.bind(null, board, [], [])).toThrow()
  expect(board.list({})).toHaveLength(0)
}

function viewIsolation(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], ["src/a"])
  const result = board.get("task-1")
  expect(result.kind).toBe("accepted")
  if (result.kind === "refused") {
    throw new Error(result.message)
  }
  result.task.writeScopes.push("mutação")
  expect(board.list({})[0]?.writeScopes).toEqual(["src/a"])
}

function restorationIsolation(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], ["src/a"])
  const restored = makeTaskBoardSut().board
  restored.restore(journal.snapshots)
  journal.snapshots[0]?.writeScopes.push("mutação")
  expect(restored.list({})[0]?.writeScopes).toEqual(["src/a"])
}

function reopen(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "alice")
  expect(updateTestTask(board, "task-1", 3, "reopen", "lead")).toBe("accepted")
}

function register(): void {
  test("restauração e numeração", restoration)
  test("falha do journal", journalFailure)
  test("isolamento da visão", viewIsolation)
  test("isolamento da restauração", restorationIsolation)
  test("reabertura de concluída", reopen)
}

describe("board-restoration", register)
