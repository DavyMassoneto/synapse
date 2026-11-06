import { type AdvisorRenderStyles } from "@/integration/pi/advisor/presentation";

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
