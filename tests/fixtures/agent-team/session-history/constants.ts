import { type SessionEntry } from "@earendil-works/pi-coding-agent"

export const TEAM_HISTORY_TEST_ENTRIES: SessionEntry[] = [
  {
    type: "custom",
    id: "1",
    parentId: null,
    timestamp: "2025-01-01",
    customType: "agent-team-member",
    data: {
      leadId: "lead-a",
      name: "ana",
      description: "analisa",
      model: "p/m",
      thinking: "high",
      cwd: ".",
      sessionId: "s",
      sessionFile: "sessao",
    },
  },
  {
    type: "custom",
    id: "2",
    parentId: "1",
    timestamp: "2025-01-01",
    customType: "agent-team-member",
    data: {
      leadId: "lead-b",
      name: "outro",
      description: "analisa",
      model: "p/m",
      thinking: "high",
      cwd: ".",
      sessionId: "s2",
      sessionFile: "sessao2",
    },
  },
  {
    type: "custom",
    id: "3",
    parentId: "2",
    timestamp: "2025-01-01",
    customType: "agent-team-task",
    data: {
      id: "t",
      revision: 1,
      subject: "tarefa",
      description: "detalhes",
      status: "pending",
      blockedBy: [],
      writeScopes: [],
    },
  },
]

export const TEAM_HISTORY_INVALID_ENTRIES: SessionEntry[] = [
  {
    type: "custom",
    id: "1",
    parentId: null,
    timestamp: "2025-01-01",
    customType: "agent-team-task",
    data: { id: "t" },
  },
]
