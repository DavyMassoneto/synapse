import { type AdvisorRenderStyles } from "./rendering-style-types.ts";

export const PREVIEW_LINES = 8;
export const RENDER_TEXT = {
  pending: "consultando...",
  success: "✓ conselho",
  title: "advisor ",
};

export const RENDER_STYLE: AdvisorRenderStyles = {
  title: "toolTitle",
  pending: "warning",
  error: "error",
  success: "success",
  muted: "muted",
  additional: "dim",
};
