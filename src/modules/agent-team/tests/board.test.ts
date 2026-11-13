import { describe, expect, test } from "vitest"
import { createTaskOutcome, createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"

function creation(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.get("task-1").kind).toBe("accepted")
}

function missing(): void {
  const { board } = makeTaskBoardSut()
  expect(board.get("task-2").kind).toBe("refused")
}

function claim(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(updateTestTask(board, "task-1", 1, "claim", "alice")).toBe("accepted")
}

function blocked(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  expect(updateTestTask(board, "task-2", 1, "claim", "alice")).toBe("refused")
}

function unblocked(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "alice")
  expect(updateTestTask(board, "task-2", 1, "claim", "alice")).toBe("accepted")
}

function stale(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  expect(updateTestTask(board, "task-1", 1, "complete", "alice")).toBe("refused")
}

function unauthorized(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  expect(updateTestTask(board, "task-1", 2, "complete", "bob")).toBe("refused")
}

function lead(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  expect(updateTestTask(board, "task-1", 2, "complete", "lead")).toBe("accepted")
}

function assignmentDenied(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.update("alice", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" }).kind).toBe(
    "refused",
  )
}

function assignmentMissing(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "absent" }).kind,
  ).toBe("refused")
}

function assignmentAccepted(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" }).kind).toBe(
    "accepted",
  )
}

function cycle(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "set_dependencies", blockedBy: ["task-2"] })
      .kind,
  ).toBe("refused")
}

function selfBlock(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "set_dependencies", blockedBy: ["task-1"] })
      .kind,
  ).toBe("refused")
}

function duplicate(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(createTaskOutcome(board, ["task-1", "task-1"], [])).toBe("refused")
}

function missingBlock(): void {
  const { board } = makeTaskBoardSut()
  expect(createTaskOutcome(board, ["missing"], [])).toBe("refused")
}

function dependent(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  expect(updateTestTask(board, "task-1", 1, "delete", "lead")).toBe("refused")
}

function release(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(updateTestTask(board, "task-1", 1, "release", "lead")).toBe("refused")
}

function reopenDenied(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(updateTestTask(board, "task-1", 1, "reopen", "lead")).toBe("refused")
}

function register(): void {
  test("criação", creation)
  test("consulta inexistente", missing)
  test("assumir tarefa pronta", claim)
  test("bloqueio impede assumir", blocked)
  test("conclusão libera bloqueio", unblocked)
  test("revisão desatualizada", stale)
  test("outro agente recusado", unauthorized)
  test("lead altera tarefa alheia", lead)
  test("reatribuição exige lead", assignmentDenied)
  test("reatribuição exige agente existente", assignmentMissing)
  test("lead reatribui", assignmentAccepted)
  test("ciclo recusado", cycle)
  test("autobloqueio recusado", selfBlock)
  test("bloqueio repetido recusado", duplicate)
  test("bloqueio inexistente recusado", missingBlock)
  test("remoção com dependente recusada", dependent)
  test("liberação exige andamento", release)
  test("reabertura exige conclusão", reopenDenied)
}

describe("quadro de tarefas", register)
