import { expect } from "vitest"
import { TaskBoard } from "../internal"
import { type TaskAction } from "../public"
import { TaskTestDirectory, TaskTestJournal } from "./doubles"
import { type TaskTestSut } from "./types"

export function makeTaskBoardSut(): TaskTestSut {
  const journal = new TaskTestJournal()
  return { board: new TaskBoard(journal, new TaskTestDirectory()), journal }
}

export function createTestTask(board: TaskBoard, blockedBy: string[], writeScopes: string[]): void {
  expect(board.create({ subject: "Título", description: "Detalhes", blockedBy, writeScopes }).kind).toBe("accepted")
}

export function updateTestTask(
  board: TaskBoard,
  taskId: string,
  expectedRevision: number,
  action: TaskAction,
  caller: string,
): string {
  return board.update(caller, { taskId, expectedRevision, action }).kind
}

export function createTaskOutcome(board: TaskBoard, blockedBy: string[], writeScopes: string[]): string {
  return board.create({ subject: "x", description: "x", blockedBy, writeScopes }).kind
}
