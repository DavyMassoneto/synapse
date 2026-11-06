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

export interface TranscriptMessage {
  kind: "user" | "assistant" | "toolResult" | "shell" | "custom" | "summary";
  blocks: TranscriptBlock[];
  name?: string;
  error?: boolean;
  hidden?: boolean;
}
