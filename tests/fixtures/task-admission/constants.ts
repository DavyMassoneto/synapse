import { type ScriptedProviderScript } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "../task-selection"
import { type AdmissionFault } from "./types"

export const ADMISSION_NATIVE_CALLBACK_SCENARIO =
  "append nativo com callback reentrante que lança devolve incerto sem apagar storage"
export const ADMISSION_NAVIGATE_ACTION = "navigate"
export const ADMISSION_RELOAD_ACTION = "reload"
export const ADMISSION_ENTRY_APPENDED_EVENT = "entry_appended"
export const ADMISSION_CUSTOM_ENTRY_TYPE = "custom"
export const ADMISSION_OBSERVATION_FAILURE = "Falha depois da persistência real"
export const ADMISSION_CLOCK_FAULT = "clock"
export const ADMISSION_MONOTONIC_FAULT = "monotonic"
export const ADMISSION_CALLBACK_FAULT = "callback"
export const ADMISSION_PORT_THROW_FAULT = "port-throw"
export const ADMISSION_NO_ACTION = "none"
export const ADMISSION_SUSPEND_ACTION = "suspend"
export const ADMISSION_RESTORE_ACTION = "restore"
export const ADMISSION_ADMISSION_OPERATION = "admission"
export const ADMISSION_TASK_OPERATION = "task"
export const ADMISSION_CLEANUP_OPERATION = "cleanup"
export const ADMISSION_OBSERVATION_SCENARIO = "persistência confirmada/incerta conserva storage e erro observável"
export const ADMISSION_EPOCH_SCENARIO = "callbacks de journal e relógios não recolocam timestamps após clear"
export const ADMISSION_REENTRANT_JOURNAL = "journal persistido seguido de suspensão não publica nem apaga admissão"
export const ADMISSION_REENTRANT_TASK = "admission-race"
export const ADMISSION_REENTRANT_WORKER = "worker"
export const ADMISSION_REFUSED_KIND = "refused"
export const ADMISSION_ACCEPTED_KIND = "accepted"
export const ADMISSION_LEAD_NAME = "lead"
export const ADMISSION_SESSION_ENCODING = "utf8"
export const ADMISSION_SUITE = "admissão atômica pelo modelo no SDK real"
export const ADMISSION_START = "admite tarefa do lead com snapshot e contexto antes do primeiro pedido"
export const ADMISSION_RELOAD = "reload preserva a admissão válida sem iniciar ou selecionar o membro"
export const ADMISSION_FAILURE = "falhas de abertura, fila e journal preservam tarefa e liberam nome"
export const ADMISSION_RACE = "revalida revisão e bloqueios depois da abertura assíncrona"
export const ADMISSION_FAILURE_MESSAGE = "admission fixture failure"
export const ADMISSION_CLOSE_FAILURE = "admission close failure"
export const ADMISSION_MEMBER_CLOSE_FAILURE = "Falha ao encerrar os recursos do membro."
export const ADMISSION_DISCARD_FAILURE = "admission discard failure"
export const ADMISSION_CLEANUP = "tenta remover storage apesar de falha ao fechar e preserva ambas as falhas"
export const ADMISSION_NOT_MOUNTED = "admission fixture not mounted"
export const ADMISSION_ENTRY = "agent-team-admission"
export const ADMISSION_CUSTOM = "custom"
export const ADMISSION_MUTATED = "mutated"
export const ADMISSION_FAULT_NONE = "none"
export const ADMISSION_FAULT_OPEN = "open"
export const ADMISSION_FAULT_QUEUE = "queue"
export const ADMISSION_FAULT_RECORD = "record"
export const ADMISSION_FAULT_REVISION = "revision"
export const ADMISSION_FAULT_BLOCKER = "blocker"
export const ADMISSION_FAULT_CLOSE = "close"
export const ADMISSION_FAULT_DISCARD = "discard"
export const ADMISSION_CLEANUP_FAILURES: AdmissionFault[] = [ADMISSION_FAULT_CLOSE, ADMISSION_FAULT_DISCARD]

export const ADMISSION_SCRIPT: ScriptedProviderScript = {
  tracks: [
    {
      marker: SELECTION_MEMBER_MARKER,
      steps: [
        { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
        { kind: "text", text: "member-admitted" },
      ],
    },
    {
      steps: [
        {
          kind: "toolCall",
          name: "team_task_create",
          argumentsJson: JSON.stringify({
            subject: "A",
            description: "Admission A",
            blocked_by: [],
            write_scopes: ["src/a"],
          }),
        },
        {
          kind: "toolCall",
          name: "team_task_create",
          argumentsJson: JSON.stringify({
            subject: "B",
            description: "Blocked B",
            blocked_by: ["task-1"],
            write_scopes: [],
          }),
        },
        {
          kind: "toolCall",
          name: "team_task_update",
          argumentsJson: JSON.stringify({ task_id: "task-1", expected_revision: 1, action: "claim" }),
        },
        {
          kind: "toolCall",
          name: "subagent",
          argumentsJson: JSON.stringify({
            name: "worker",
            description: "fixture",
            task_id: "task-1",
            expected_revision: 2,
          }),
        },
        { kind: "text", text: "admission-finished" },
        { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
        { kind: "text", text: "after-reload" },
      ],
    },
  ],
}

export const ADMISSION_RETRY_SCRIPT: ScriptedProviderScript = {
  tracks: [
    { marker: SELECTION_MEMBER_MARKER, steps: [{ kind: "text", text: "member-admitted" }] },
    {
      steps: [
        {
          kind: "toolCall",
          name: "team_task_create",
          argumentsJson: JSON.stringify({ subject: "A", description: "Admission A", blocked_by: [], write_scopes: [] }),
        },
        { kind: "text", text: "prepared" },
        {
          kind: "toolCall",
          name: "subagent",
          argumentsJson: JSON.stringify({
            name: "worker",
            description: "fixture",
            task_id: "task-1",
            expected_revision: 1,
          }),
        },
        { kind: "text", text: "attempted" },
        {
          kind: "toolCall",
          name: "subagent",
          argumentsJson: JSON.stringify({
            name: "worker",
            description: "fixture",
            task_id: "task-1",
            expected_revision: 1,
          }),
        },
        { kind: "text", text: "retried" },
      ],
    },
  ],
}

export const ADMISSION_FAILURES: AdmissionFault[] = [
  ADMISSION_FAULT_OPEN,
  ADMISSION_FAULT_QUEUE,
  ADMISSION_FAULT_RECORD,
]
export const ADMISSION_RACES: AdmissionFault[] = [ADMISSION_FAULT_REVISION, ADMISSION_FAULT_BLOCKER]
