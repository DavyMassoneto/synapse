import { describe, expect, test } from "vitest"
import { leadTools, memberTools, TeamAgentHandlers, TeamTaskHandlers } from "#synapse/integration"
import { type TeamToolsSut, ToolsTeamDouble } from "../fixtures"

function makeSut(): TeamToolsSut {
  const team = new ToolsTeamDouble()
  return {
    team,
    tools: leadTools(team),
    handlers: new TeamAgentHandlers(team, "worker"),
    tasks: new TeamTaskHandlers(team, "worker"),
  }
}

async function startMember(): Promise<void> {
  const sut = makeSut()
  const result = await sut.handlers.subagent("id", {
    task: "Execute",
    description: "Trabalho",
    model: "provider/model",
    thinking: "high",
  })
  expect(result.isError).toBe(false)
  expect(sut.team.startInput).toMatchObject({ task: "Execute", model: "provider/model" })
}

async function refuseStart(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect((await sut.handlers.subagent("id", { task: "Execute", description: "Trabalho" })).isError).toBe(true)
}

async function sendMember(): Promise<void> {
  const sut = makeSut()
  const result = await sut.handlers.send("id", { agent: "lead", message: "Pronto" })
  expect(result.isError).toBe(false)
  expect(sut.team.sender).toBe("worker")
}

async function refuseSend(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect((await sut.handlers.send("id", { agent: "missing", message: "Mensagem" })).isError).toBe(true)
}

async function interruptMember(): Promise<void> {
  const sut = makeSut()
  expect((await sut.handlers.interrupt("id", { agent: "worker" })).isError).toBe(false)
  expect(sut.team.target).toBe("worker")
}

async function refuseInterrupt(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect((await sut.handlers.interrupt("id", { agent: "missing" })).isError).toBe(true)
}

async function createTask(): Promise<void> {
  const sut = makeSut()
  const result = await sut.tasks.create("id", {
    subject: "Tarefa",
    description: "Descrição",
    blocked_by: [],
    write_scopes: ["src"],
  })
  expect(result.isError).toBe(false)
  expect(sut.team.createInput).toMatchObject({ blockedBy: [], writeScopes: ["src"] })
}

async function refuseCreate(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect(
    (
      await sut.tasks.create("id", {
        subject: "",
        description: "",
        blocked_by: [],
        write_scopes: [],
      })
    ).isError,
  ).toBe(true)
}

async function getTask(): Promise<void> {
  const sut = makeSut()
  expect((await sut.tasks.get("id", { task_id: "task-1" })).isError).toBe(false)
}

async function refuseGet(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect((await sut.tasks.get("id", { task_id: "missing" })).isError).toBe(true)
}

async function updateTask(): Promise<void> {
  const sut = makeSut()
  expect(
    (
      await sut.tasks.update("id", {
        task_id: "task-1",
        expected_revision: 1,
        action: "claim",
      })
    ).isError,
  ).toBe(false)
  expect(sut.team.sender).toBe("worker")
  expect(sut.team.update).toEqual({ taskId: "task-1", expectedRevision: 1, action: "claim" })
}

async function refuseUpdate(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect(
    (
      await sut.tasks.update("id", {
        task_id: "task-1",
        expected_revision: 0,
        action: "claim",
      })
    ).isError,
  ).toBe(true)
}

async function listAgents(): Promise<void> {
  const sut = makeSut()
  expect((await sut.handlers.list()).content).toMatchObject([{ text: "[]" }])
}

async function listTasks(): Promise<void> {
  const sut = makeSut()
  expect((await sut.tasks.listTasks("id", { unowned: false })).isError).toBe(false)
  expect(sut.team.filter).toEqual({ unowned: false })
}

async function waitMember(): Promise<void> {
  const sut = makeSut()
  expect((await sut.handlers.wait("id", { timeout_ms: 1000 })).content).toMatchObject([
    { text: '{"kind":"wait_completed","timedOut":false}' },
  ])
  expect(sut.team.sender).toBe("worker")
}

async function cancelledWait(): Promise<void> {
  const sut = makeSut()
  await expect(sut.handlers.wait("id", { timeout_ms: 1000 }, AbortSignal.abort())).rejects.toMatchObject({
    name: "AbortError",
  })
}

function rejectLeadOnly(): void {
  const sut = makeSut()
  const tools = memberTools(sut.team, "worker")
  expect(tools.map((tool) => tool.name)).not.toContain("subagent")
  expect(tools.map((tool) => tool.name)).not.toContain("interrupt_agent")
}

function registeredTools(): void {
  const sut = makeSut()
  expect(sut.tools.map((tool) => tool.name)).toEqual([
    "subagent",
    "interrupt_agent",
    "list_models",
    "send_message",
    "list_agents",
    "wait_agent",
    "team_task_create",
    "team_task_update",
    "team_task_get",
    "team_task_list",
  ])
}

async function refusedWait(): Promise<void> {
  const sut = makeSut()
  sut.team.refused = true
  expect((await sut.handlers.wait("id", { timeout_ms: 1000 })).isError).toBe(true)
}

function registerTests(): void {
  test("registra as dez ferramentas do lead", registeredTools)
  test("inicia membro", startMember)
  test("recusa início como erro", refuseStart)
  test("mensagem usa remetente da ferramenta", sendMember)
  test("recusa mensagem como erro", refuseSend)
  test("interrompe membro", interruptMember)
  test("recusa interrupção como erro", refuseInterrupt)
  test("cria tarefa com campos traduzidos", createTask)
  test("recusa criação como erro", refuseCreate)
  test("consulta tarefa", getTask)
  test("recusa consulta como erro", refuseGet)
  test("atualiza tarefa como dono da ferramenta", updateTask)
  test("recusa atualização como erro", refuseUpdate)
  test("lista agentes", listAgents)
  test("lista tarefas preservando false", listTasks)
  test("espera recusada vira erro da ferramenta", refusedWait)
  test("espera como dono da ferramenta", waitMember)
  test("propaga cancelamento da espera", cancelledWait)
  test("membro não recebe ferramentas exclusivas do lead", rejectLeadOnly)
}

describe("ferramentas da equipe", registerTests)
