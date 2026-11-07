import { type ThemeColor } from "@earendil-works/pi-coding-agent";

export const RENDER_STYLE = {
  title: "toolTitle",
  pending: "warning",
  error: "error",
  success: "success",
  muted: "muted",
  additional: "dim",
} satisfies Record<string, ThemeColor>;
