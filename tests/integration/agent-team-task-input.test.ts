import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { TEAM_TOOL_UPDATE_TASK_PARAMETERS, translateTeamTaskUpdate } from "#synapse/integration"

function rejectsEmptySubject(): void {
  expect(
    Value.Check(TEAM_TOOL_UPDATE_TASK_PARAMETERS, {
      task_id: "task-1",
      expected_revision: 1,
      action: "edit",
      subject: "",
    }),
  ).toBe(false)
}

function preservesAbsentSubject(): void {
  expect(
    translateTeamTaskUpdate({ task_id: "task-1", expected_revision: 1, action: "edit", description: "Descrição" }),
  ).toEqual({ taskId: "task-1", expectedRevision: 1, action: "edit", description: "Descrição" })
}

function preservesEmptyForCore(): void {
  expect(
    translateTeamTaskUpdate({ task_id: "task-1", expected_revision: 1, action: "edit", subject: "" }),
  ).toMatchObject({ subject: "" })
}

function suite(): void {
  test("esquema recusa título vazio", rejectsEmptySubject)
  test("ausência de título não altera campo", preservesAbsentSubject)
  test("tradução não apaga vazio antes do núcleo", preservesEmptyForCore)
}

describe("campos opcionais de tarefa", suite)
