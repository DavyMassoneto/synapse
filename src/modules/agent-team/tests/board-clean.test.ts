import { describe, expect, test } from "vitest"
import { createTestTask, makeTaskBoardSut, updateTestTask } from "./board-scenario"
import {
  TEAM_TEST_CLEAN_BATCH,
  TEAM_TEST_CLEAN_BLOCKERS,
  TEAM_TEST_CLEAN_CAPACITY,
  TEAM_TEST_CLEAN_EMPTY,
  TEAM_TEST_CLEAN_FAILURE,
  TEAM_TEST_CLEAN_MUTATION,
  TEAM_TEST_CLEAN_REFUSED,
  TEAM_TEST_CLEAN_REPLAY,
  TEAM_TEST_CLEAN_SUITE,
} from "./constants"

function cleansCompletedAndUnblocks(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, ["task-1"], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  expect(board.clean("lead")).toEqual({ kind: "cleaned", count: 1 })
  expect(journal.batches).toHaveLength(1)
  expect(board.list({})).toMatchObject([{ id: "task-2", revision: 2, blockedBy: [], ready: true }])
  expect(updateTestTask(board, "task-2", 1, "claim", "alice")).toBe("refused")
  expect(updateTestTask(board, "task-2", 2, "claim", "alice")).toBe("accepted")
}

function refusesMember(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.clean("alice").kind).toBe("refused")
  expect(journal.batches).toHaveLength(0)
}

function emptyDoesNotJournal(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  expect(board.clean("lead")).toEqual({ kind: "cleaned", count: 0 })
  expect(journal.batches).toHaveLength(0)
}

function journalFailureKeepsBoard(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  journal.fail = true
  expect(board.clean.bind(board, "lead")).toThrow()
  expect(board.list({})).toMatchObject([{ id: "task-1", status: "completed", revision: 3 }])
}

function restorePreservesCleanAndNextId(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  board.clean("lead")
  board.restore(journal.snapshots)
  expect(board.list({})).toHaveLength(0)
  expect(updateTestTask(board, "task-1", 4, "reopen", "lead")).toBe("refused")
  createTestTask(board, [], [])
  expect(board.list({})).toMatchObject([{ id: "task-2" }])
}

function keepsPendingBlocker(): void {
  const { board } = makeTaskBoardSut()
  createTestTask(board, [], [])
  createTestTask(board, [], [])
  createTestTask(board, ["task-1", "task-2"], [])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  board.clean("lead")
  expect(board.list({})).toMatchObject([
    { id: "task-2", status: "pending", revision: 1 },
    { id: "task-3", blockedBy: ["task-2"], revision: 2, ready: false },
  ])
  expect(updateTestTask(board, "task-3", 2, "claim", "alice")).toBe("refused")
}

function freesCapacity(): void {
  const { board } = makeTaskBoardSut()
  for (let index = 0; index < 256; index++) {
    createTestTask(board, [], [])
  }
  expect(board.create({ subject: "x", description: "x", blockedBy: [], writeScopes: [] }).kind).toBe("refused")
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  board.clean("lead")
  expect(board.create({ subject: "x", description: "x", blockedBy: [], writeScopes: [] }).kind).toBe("accepted")
}

function mutationFailureKeepsBothSnapshots(): void {
  const { board, journal } = makeTaskBoardSut()
  createTestTask(board, [], ["source"])
  createTestTask(board, ["task-1"], ["open"])
  updateTestTask(board, "task-1", 1, "claim", "alice")
  updateTestTask(board, "task-1", 2, "complete", "lead")
  const previous = board.list({})
  journal.mutateAndFail = true
  expect(board.clean.bind(board, "lead")).toThrow()
  expect(board.list({})).toEqual(previous)
}

function suite(): void {
  test(TEAM_TEST_CLEAN_MUTATION, mutationFailureKeepsBothSnapshots)
  test(TEAM_TEST_CLEAN_BLOCKERS, keepsPendingBlocker)
  test(TEAM_TEST_CLEAN_CAPACITY, freesCapacity)
  test(TEAM_TEST_CLEAN_BATCH, cleansCompletedAndUnblocks)
  test(TEAM_TEST_CLEAN_REFUSED, refusesMember)
  test(TEAM_TEST_CLEAN_EMPTY, emptyDoesNotJournal)
  test(TEAM_TEST_CLEAN_FAILURE, journalFailureKeepsBoard)
  test(TEAM_TEST_CLEAN_REPLAY, restorePreservesCleanAndNextId)
}

describe(TEAM_TEST_CLEAN_SUITE, suite)
