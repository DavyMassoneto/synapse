import { describe, expect, test } from "vitest"
import { createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"

function filterStatus(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.list({ status: "in_progress" })).toHaveLength(0)
}

function filterOwner(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  expect(board.list({ owner: "alice" })).toHaveLength(1)
}

function filterUnowned(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.list({ unowned: true })).toHaveLength(1)
}

function filterReady(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.list({ ready: true })).toHaveLength(1)
}

function deletedList(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "delete", "lead")
  expect(board.list({})).toHaveLength(0)
}

function deletedGet(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "delete", "lead")
  expect(board.get("task-1").kind).toBe("accepted")
}

function register(): void {
  test("filtro de estado", filterStatus)
  test("filtro de responsável", filterOwner)
  test("filtro sem responsável", filterUnowned)
  test("filtro de prontidão", filterReady)
  test("apagada some da lista", deletedList)
  test("apagada permanece consultável", deletedGet)
}

describe("board-filtering", register)
