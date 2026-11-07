import type {
  BeforeAgentStartEvent,
  ToolResultEvent,
  TurnEndEvent,
} from "@earendil-works/pi-coding-agent";

export function beforeStartEvent(): BeforeAgentStartEvent {
  return {
    type: "before_agent_start",
    messageType: "user",
    prompt: "hello",
    systemPrompt: "system",
    systemPromptOptions: {
      cwd: ".",
      selectedTools: [],
      hiddenTools: [],
      toolSnippets: {},
      toolGuidelines: {},
      promptGuidelines: [],
      appendSystemPrompt: "",
      sections: {},
      contextFiles: [],
      skills: [],
    },
  };
}

export function turnEvent(): TurnEndEvent {
  return {
    type: "turn_end",
    turnIndex: 0,
    message: { role: "user", content: "hello", timestamp: 0 },
    toolResults: [
      {
        role: "toolResult",
        toolCallId: "id",
        toolName: "read",
        content: [],
        isError: false,
        timestamp: 0,
      },
    ],
    messageEntryId: "entry",
    toolResultEntryIds: [],
    entries: [],
    continue: false,
    outcome: "completed",
    context: {
      contextEntries: [],
      contextMessages: [],
      llmMessages: [],
      pendingMessages: [],
      canContinue: true,
    },
  };
}

export function advisorToolResult(): ToolResultEvent {
  return {
    type: "tool_result",
    toolCallId: "advisor",
    toolName: "advisor",
    input: {},
    content: [],
    details: {},
    isError: false,
  };
}
