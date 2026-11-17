import { type ScriptedProviderScript } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "../task-selection"
import { MESSAGING_PEER_MARKER, MESSAGING_SETUP } from "./constants"

export const MESSAGING_INVALID_SCRIPT: ScriptedProviderScript = {
  tracks: [
    { marker: SELECTION_MEMBER_MARKER, steps: [{ kind: "text", text: "worker-admitted" }] },
    { marker: MESSAGING_PEER_MARKER, steps: [{ kind: "text", text: "peer-admitted" }] },
    {
      steps: [
        ...MESSAGING_SETUP,
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "stale",
            mode: "delegation",
            task_id: "task-1",
            expected_revision: 1,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "blocked",
            mode: "delegation",
            task_id: "task-4",
            expected_revision: 1,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "missing",
            message: "missing",
            mode: "delegation",
            task_id: "task-3",
            expected_revision: 1,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "lead",
            message: "self",
            mode: "delegation",
            task_id: "task-3",
            expected_revision: 1,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({ agent: "worker", message: "missing mode" }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({ agent: "worker", message: "missing task", mode: "delegation" }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "coordination task",
            mode: "coordination",
            task_id: "task-3",
            expected_revision: 1,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "zero revision",
            mode: "delegation",
            task_id: "task-3",
            expected_revision: 0,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "terminal status",
            mode: "delegation",
            task_id: "task-5",
            expected_revision: 3,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "missing task id",
            mode: "delegation",
            task_id: "missing-task",
            expected_revision: 1,
          }),
        },
        { kind: "text", text: "invalid-checked" },
      ],
    },
  ],
}
