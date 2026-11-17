import { type ScriptedProviderScript, type ScriptedProviderSteps } from "../scripted-provider"
import { SELECTION_MEMBER_MARKER } from "../task-selection"

export const MESSAGING_SUITE = "mensagens por tarefa no SDK real"
export const MESSAGING_LIFECYCLE = "coordenação não seleciona; delegação seleciona e entrega snapshot antes de executar"
export const MESSAGING_OWNERSHIP = "membro subdelega tarefa própria ou do destino, mas não de terceiro"
export const MESSAGING_JOURNAL_FAILURE = "journal falhando não entrega nem altera tarefa ou seleção"
export const MESSAGING_INVALID = "recusa revisão, bloqueio, destino e contrato inválidos sem efeito"
export const MESSAGING_FAILURE = "messaging journal failure"
export const MESSAGING_NOT_MOUNTED = "messaging fixture not mounted"
export const MESSAGING_PEER_MARKER = 'Seu nome é \\"peer\\"'
export const MESSAGING_MUTATED = "mutated journal argument"
export const MESSAGING_STREAMING = "delegação em curso usa steer nativo sem reiniciar ou cancelar o turno"

export const MESSAGING_SETUP: ScriptedProviderSteps = [
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "Worker", description: "Worker", blocked_by: [], write_scopes: [] }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({ subject: "Peer", description: "Peer", blocked_by: [], write_scopes: [] }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({
      subject: "Delegated",
      description: "Delegated",
      blocked_by: [],
      write_scopes: ["src/delegated"],
    }),
  },
  {
    kind: "toolCall",
    name: "team_task_create",
    argumentsJson: JSON.stringify({
      subject: "Blocked",
      description: "Blocked",
      blocked_by: ["task-3"],
      write_scopes: [],
    }),
  },
  {
    kind: "toolCall",
    name: "subagent",
    argumentsJson: JSON.stringify({ name: "worker", description: "Worker", task_id: "task-1", expected_revision: 1 }),
  },
  {
    kind: "toolCall",
    name: "subagent",
    argumentsJson: JSON.stringify({ name: "peer", description: "Peer", task_id: "task-2", expected_revision: 1 }),
  },
  { kind: "text", text: "prepared" },
]

export const MESSAGING_SCRIPT: ScriptedProviderScript = {
  tracks: [
    {
      marker: SELECTION_MEMBER_MARKER,
      steps: [
        { kind: "text", text: "worker-admitted" },
        { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
        { kind: "text", text: "worker-coordinated" },
        { kind: "toolCall", name: "read", argumentsJson: JSON.stringify({ path: "settings.json" }) },
        { kind: "text", text: "worker-delegated" },
      ],
    },
    { marker: MESSAGING_PEER_MARKER, steps: [{ kind: "text", text: "peer-admitted" }] },
    {
      steps: [
        ...MESSAGING_SETUP,
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({ agent: "worker", message: "coordination probe", mode: "coordination" }),
        },
        { kind: "text", text: "coordinated" },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "delegation probe",
            mode: "delegation",
            task_id: "task-3",
            expected_revision: 1,
          }),
        },
        { kind: "text", text: "delegated" },
      ],
    },
  ],
}

export const MESSAGING_OWNERSHIP_SCRIPT: ScriptedProviderScript = {
  tracks: [
    {
      marker: SELECTION_MEMBER_MARKER,
      steps: [
        { kind: "text", text: "worker-admitted" },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "peer",
            message: "own task",
            mode: "delegation",
            task_id: "task-1",
            expected_revision: 2,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "peer",
            message: "target task",
            mode: "delegation",
            task_id: "task-1",
            expected_revision: 3,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "lead",
            message: "third owner refused",
            mode: "delegation",
            task_id: "task-2",
            expected_revision: 2,
          }),
        },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "lead",
            message: "free task to lead",
            mode: "delegation",
            task_id: "task-3",
            expected_revision: 1,
          }),
        },
        { kind: "text", text: "ownership-checked" },
      ],
    },
    {
      marker: MESSAGING_PEER_MARKER,
      steps: [
        { kind: "text", text: "peer-admitted" },
        { kind: "text", text: "peer-received" },
        { kind: "text", text: "peer-received-again" },
      ],
    },
    {
      steps: [
        ...MESSAGING_SETUP,
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({ agent: "worker", message: "check ownership", mode: "coordination" }),
        },
        { kind: "text", text: "requested" },
        { kind: "text", text: "lead-received-delegation" },
        {
          kind: "toolCall",
          name: "send_message",
          argumentsJson: JSON.stringify({
            agent: "worker",
            message: "lead transfers peer task",
            mode: "delegation",
            task_id: "task-2",
            expected_revision: 2,
          }),
        },
        { kind: "text", text: "lead-transferred" },
      ],
    },
  ],
}
