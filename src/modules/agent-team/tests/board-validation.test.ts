import { describe, expect, test } from "vitest"
import { TASK_BOARD_MAX_SUBJECT_LENGTH, TASK_BOARD_MAX_TASKS } from "../internal"
import { createTaskOutcome, createTestTask, makeTaskBoardSut } from "./board-scenario"

function empty(): void {
  const { board } = makeTaskBoardSut()
  expect(board.create({ subject: " ", description: "x", blockedBy: [], writeScopes: [] }).kind).toBe("refused")
}

function longText(): void {
  const { board } = makeTaskBoardSut()
  expect(
    board.create({
      subject: "x".repeat(TASK_BOARD_MAX_SUBJECT_LENGTH + 1),
      description: "x",
      blockedBy: [],
      writeScopes: [],
    }).kind,
  ).toBe("refused")
}

function limit(): void {
  const { board } = makeTaskBoardSut()
  for (let i = 0; i < TASK_BOARD_MAX_TASKS; i += 1) {
    createTestTask(board, [], [])
  }
  expect(createTaskOutcome(board, [], [])).toBe("refused")
}

function rejectsEmptyEditedSubject(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "edit", subject: "", description: "nova" })
      .kind,
  ).toBe("refused")
}

function rejectsEmptyEditedDescription(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "edit", subject: "novo", description: "" })
      .kind,
  ).toBe("refused")
}

function preservesAbsentEditedSubject(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  const result = board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "edit", description: "nova" })
  expect(result).toEqual(
    expect.objectContaining({
      kind: "accepted",
      task: expect.objectContaining({ subject: "Título", description: "nova" }),
    }),
  )
}

function register(): void {
  test("edição recusa assunto vazio mesmo com descrição válida", rejectsEmptyEditedSubject)
  test("edição recusa descrição vazia mesmo com assunto válido", rejectsEmptyEditedDescription)
  test("edição preserva assunto ausente", preservesAbsentEditedSubject)
  test("texto vazio", empty)
  test("texto longo", longText)
  test("limite de tarefas", limit)
}

describe("board-validation", register)
