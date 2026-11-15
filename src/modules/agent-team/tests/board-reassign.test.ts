import { describe, expect, test } from "vitest"
import { createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"

function reservesPendingTask(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" }),
  ).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "pending", revision: 2 },
  })
}

function reservesBlockedTask(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  expect(
    board.update("lead", { taskId: "task-2", expectedRevision: 1, action: "reassign", owner: "bob" }),
  ).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "pending", ready: false, blockedBy: ["task-1"] },
  })
}

function doesNotStartReservedTask(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" })
  expect(updateTestTask(board, "task-1", 2, "complete", "bob")).toBe("refused")
  expect(board.get("task-1")).toMatchObject({ kind: "accepted", task: { status: "pending", revision: 2 } })
}

function returnsActiveTaskToPending(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(updateTestTask(board, "task-1", 1, "claim", "alice")).toBe("accepted")
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 2, action: "reassign", owner: "bob" }),
  ).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "pending", revision: 3 },
  })
}

function refusesStaleReassignment(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "alice" })
  expect(board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" }).kind).toBe(
    "refused",
  )
  expect(board.get("task-1")).toMatchObject({
    kind: "accepted",
    task: { owner: "alice", status: "pending", revision: 2 },
  })
}

function refusesMemberReassignment(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("alice", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" }),
  ).toMatchObject({
    kind: "refused",
    message: "Só o lead pode reatribuir tarefas",
  })
  expect(board.get("task-1")).toMatchObject({ kind: "accepted", task: { status: "pending", revision: 1 } })
}

function refusesMissingOwner(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(
    board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "absent" }),
  ).toMatchObject({
    kind: "refused",
    message: "O agente não existe nesta equipe: absent",
  })
  expect(board.get("task-1")).toMatchObject({ kind: "accepted", task: { status: "pending", revision: 1 } })
}

function reservedOwnerClaimsTask(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" })
  expect(board.update("bob", { taskId: "task-1", expectedRevision: 2, action: "claim" })).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "in_progress", revision: 3 },
  })
}

function refusesClaimByOtherMember(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" })
  expect(updateTestTask(board, "task-1", 2, "claim", "alice")).toBe("refused")
  expect(board.get("task-1")).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "pending", revision: 2 },
  })
}

function refusesClaimWhileBlocked(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  board.update("lead", { taskId: "task-2", expectedRevision: 1, action: "reassign", owner: "bob" })
  expect(updateTestTask(board, "task-2", 2, "claim", "bob")).toBe("refused")
  expect(board.get("task-2")).toMatchObject({
    kind: "accepted",
    task: { owner: "bob", status: "pending", revision: 2 },
  })
}

function removesReservation(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  board.update("lead", { taskId: "task-1", expectedRevision: 1, action: "reassign", owner: "bob" })
  const result = board.update("lead", { taskId: "task-1", expectedRevision: 2, action: "reassign" })
  expect(result).toMatchObject({ kind: "accepted", task: { status: "pending", revision: 3 } })
  if (result.kind === "accepted") {
    expect(result.task.owner).toBeUndefined()
  }
}

function register(): void {
  test("reserva responsável mantendo tarefa pendente", reservesPendingTask)
  test("reserva responsável de tarefa bloqueada", reservesBlockedTask)
  test("não inicia tarefa reservada", doesNotStartReservedTask)
  test("reatribuição de tarefa em andamento volta a pendente", returnsActiveTaskToPending)
  test("recusa revisão antiga sem mudar reserva", refusesStaleReassignment)
  test("recusa reatribuição por membro", refusesMemberReassignment)
  test("recusa responsável inexistente", refusesMissingOwner)
  test("claim posterior do responsável inicia tarefa", reservedOwnerClaimsTask)
  test("reserva impede claim de outro membro", refusesClaimByOtherMember)
  test("responsável reservado não assume enquanto bloqueada", refusesClaimWhileBlocked)
  test("lead remove reserva sem iniciar tarefa", removesReservation)
}

describe("reserva de responsável no quadro", register)
