import { type ScriptedProviderSteps } from "../scripted-provider"

export const SELECTION_DIRECTORY = "task-selection-"
export const SELECTION_AGENT_DIRECTORY = "agent"
export const SELECTION_PROJECT_DIRECTORY = "project"
export const SELECTION_SETTINGS = "settings.json"
export const SELECTION_CONFIG = "agent-team.json"
export const SELECTION_SCRIPT = "script.json"
export const SELECTION_LOG = "requests.jsonl"
export const SELECTION_SESSIONS = "sessions"
export const SELECTION_MEMBER = "worker"
export const SELECTION_PROMPT = "Continue o cenário determinístico."
export const SELECTION_NOTICE_MARKER = "terminou o turno. Resposta final:"
export const SELECTION_NOTICE_REPLY = "Aviso recebido."
export const SELECTION_PROVIDER_URL = new URL("./register-provider.ts", import.meta.url)
export const SELECTION_MEMBER_MARKER = 'Seu nome é \\"worker\\"'
export const SELECTION_EXCLUDED_EXTENSION_URL = new URL("./excluded-extension/register.ts", import.meta.url)
export const SELECTION_EXTERNAL_EXTENSION_URL = new URL("./external-extension/register.ts", import.meta.url)
export const SELECTION_AGENT_ENVIRONMENT = "PI_CODING_AGENT_DIR"
export const SELECTION_DISABLE_EXTENSION_PREFIX = "-"
export const SELECTION_SYSTEM_ROLE = "system"
export const SELECTION_NO_TEAM = "Equipe não montada"
export const SELECTION_SESSION_START = "session_start"
export const SELECTION_CLEANUP_OBSERVATION_MS = 3000
export const SELECTION_CLEANUP_POLL_MS = 50
export const SELECTION_CLEANUP_START = "fechamento após início não recria arquivos durante janela de observação"
export const SELECTION_CLEANUP_REFUSAL = "fechamento após recusas não recria arquivos durante janela de observação"
export const SELECTION_TIMEOUT_MS = 30000
export const SELECTION_POLL_MS = 10
export const SELECTION_SUITE = "seleção explícita no SDK real"
export const SELECTION_SCENARIO = "claim/resume selecionam caller; reload só restaura estado e configuração"

export const SELECTION_LEAD_STEPS: ScriptedProviderSteps = [
  { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "A", description: "A", blocked_by: [], write_scopes: ["src/a"] }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "B", description: "B", blocked_by: [], write_scopes: ["src/b"] }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({
      subject: "Blocked",
      description: "Blocked",
      blocked_by: ["task-2"],
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
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-1", expected_revision: 1, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-3", expected_revision: 1, action: "claim" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 1, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "subagent",
    argumentsJson: JSON.stringify({
      name: "worker",
      description: "fixture",
      task: "Continue o cenário determinístico.",
    }),
  },
  { kind: "text", text: "phase-1" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 1, action: "reassign", owner: "worker" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-3", expected_revision: 1, action: "reassign", owner: "worker" }),
  },
  { kind: "text", text: "phase-2" },
  {
    kind: "toolCall",
    name: "send_message",
    argumentsJson: JSON.stringify({ agent: "worker", message: "Assuma a tarefa reservada." }),
  },
  { kind: "text", text: "phase-3" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 3, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "D", description: "D", blocked_by: [], write_scopes: [] }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-4", expected_revision: 1, action: "claim" }),
  },
  { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
  { kind: "text", text: "phase-4" },
  { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
  { kind: "text", text: "phase-5" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-1", expected_revision: 2, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "send_message",
    argumentsJson: JSON.stringify({ agent: "worker", message: "Retome explicitamente." }),
  },
  { kind: "text", text: "phase-6" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-1", expected_revision: 3, action: "complete" }),
  },
  {
    kind: "toolCall",
    name: "send_message",
    argumentsJson: JSON.stringify({ agent: "worker", message: "Confira a seleção e conclua." }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({
      task_id: "task-4",
      expected_revision: 2,
      action: "set_dependencies",
      blocked_by: ["task-3"],
    }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-4", expected_revision: 3, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-4", expected_revision: 3, action: "reassign", owner: "lead" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-4", expected_revision: 4, action: "resume" }),
  },
  { kind: "text", text: "phase-7" },
]

export const SELECTION_MEMBER_STEPS: ScriptedProviderSteps = [
  { kind: "text", text: "member-idle" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-1", expected_revision: 2, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-3", expected_revision: 2, action: "claim" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 2, action: "claim" }),
  },
  { kind: "text", text: "member-claimed" },
  { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 3, action: "resume" }),
  },
  { kind: "text", text: "member-resumed" },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-2", expected_revision: 4, action: "complete" }),
  },
  { kind: "text", text: "member-completed" },
]
