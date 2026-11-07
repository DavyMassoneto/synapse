import type { CustomMessageEntryDraft } from "@earendil-works/pi-coding-agent";
import { REMINDER_DISPLAY, REMINDER_TYPE } from "../constants";

export function reminderEntry(content: string): CustomMessageEntryDraft {
  return { type: "custom_message", customType: REMINDER_TYPE, content, display: REMINDER_DISPLAY };
}
