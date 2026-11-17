import { type ScriptedProviderSteps } from "../scripted-provider"

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
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "Admission", description: "fixture", blocked_by: [], write_scopes: [] }),
  },
  {
    kind: "toolCall",
    name: "subagent",
    argumentsJson: JSON.stringify({
      name: "worker",
      description: "fixture",
      task_id: "task-4",
      expected_revision: 1,
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
    argumentsJson: JSON.stringify({ task_id: "task-5", expected_revision: 1, action: "claim" }),
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
      task_id: "task-5",
      expected_revision: 2,
      action: "set_dependencies",
      blocked_by: ["task-3"],
    }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-5", expected_revision: 3, action: "resume" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-5", expected_revision: 3, action: "reassign", owner: "lead" }),
  },
  {
    kind: "toolCall",
    name: "team_task_update",
    argumentsJson: JSON.stringify({ task_id: "task-5", expected_revision: 4, action: "resume" }),
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
