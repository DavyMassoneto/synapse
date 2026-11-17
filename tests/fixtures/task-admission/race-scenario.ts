import { type ScriptedProviderScript } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "../task-selection"

export const ADMISSION_RACE_SCRIPT: ScriptedProviderScript = {
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
            expected_revision: 2,
          }),
        },
        { kind: "text", text: "attempted" },
      ],
    },
  ],
}
