import { type ScriptedProviderStep, type ScriptedProviderSteps } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "../task-selection"
import { type AdmissionRefusalScenario, type AdmissionToolCallStep } from "./types"

export const ADMISSION_REFUSAL_MEMBER_MARKER = SELECTION_MEMBER_MARKER
export const ADMISSION_REFUSAL_MEMBER_STEPS: ScriptedProviderSteps = [{ kind: "text", text: "member-admitted" }]
export const ADMISSION_REFUSAL_PREPARATION: ScriptedProviderSteps = [
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
    argumentsJson: JSON.stringify({ subject: "B", description: "Blocked B", blocked_by: ["task-1"], write_scopes: [] }),
  },
]
export const ADMISSION_REFUSAL_CALL: AdmissionToolCallStep = { kind: "toolCall", name: "subagent", argumentsJson: "" }
export const ADMISSION_REFUSAL_END: ScriptedProviderStep = { kind: "text", text: "admission-refused" }

export const ADMISSION_REFUSALS: AdmissionRefusalScenario[] = [
  {
    name: "recusa texto livre sem task_id e revisão antes de abrir membro",
    argumentsJson: JSON.stringify({ name: "worker", description: "fixture", task: "legacy free text" }),
  },
  {
    name: "recusa revisão zero antes de abrir membro",
    argumentsJson: JSON.stringify({ name: "worker", description: "fixture", task_id: "task-1", expected_revision: 0 }),
  },
  {
    name: "recusa revisão stale antes de abrir membro",
    argumentsJson: JSON.stringify({ name: "worker", description: "fixture", task_id: "task-1", expected_revision: 9 }),
  },
  {
    name: "recusa tarefa bloqueada antes de abrir membro",
    argumentsJson: JSON.stringify({ name: "worker", description: "fixture", task_id: "task-2", expected_revision: 1 }),
  },
]
