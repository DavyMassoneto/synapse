import type { AssistantMessage, ImageContent } from "@earendil-works/pi-ai";

export type TextBlocks = Array<ImageContent | AssistantMessage["content"][number]>;
