export type TranscriptBlock = TranscriptText | TranscriptImage | TranscriptCall;

export interface TranscriptText {
  kind: "text";
  text: string;
}

export interface TranscriptImage {
  kind: "image";
}

export interface TranscriptCall {
  kind: "call";
  name: string;
  arguments: string;
}

export interface UserTranscript {
  kind: "user";
  blocks: TranscriptBlock[];
}

export interface AssistantTranscript {
  kind: "assistant";
  blocks: TranscriptBlock[];
}

export interface ToolResultTranscript {
  kind: "toolResult";
  tool: string;
  error: boolean;
  blocks: TranscriptBlock[];
}

export interface ShellTranscript {
  kind: "shell";
  command: string;
  hidden: boolean;
  blocks: TranscriptBlock[];
}

export interface CustomTranscript {
  kind: "custom";
  customType: string;
  blocks: TranscriptBlock[];
}

export interface SummaryTranscript {
  kind: "summary";
  blocks: TranscriptBlock[];
}

export type TranscriptMessage =
  | UserTranscript
  | AssistantTranscript
  | ToolResultTranscript
  | ShellTranscript
  | CustomTranscript
  | SummaryTranscript;
