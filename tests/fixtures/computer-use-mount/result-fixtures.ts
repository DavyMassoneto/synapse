import { type PiProcessRequestLog } from "../request-log"
import { COMPUTER_MOUNT_TEXT, COMPUTER_MOUNT_TOOL_RESULT_ROLE } from "./constants"

export const COMPUTER_MOUNT_RESULT_LAST: PiProcessRequestLog = {
  messages: [
    { role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: [{ type: COMPUTER_MOUNT_TEXT, text: "anterior" }] },
    { role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: [{ type: COMPUTER_MOUNT_TEXT, text: "último" }] },
    { role: "assistant", content: [{ type: COMPUTER_MOUNT_TEXT, text: "posterior" }] },
  ],
}

export const COMPUTER_MOUNT_RESULT_FIRST: PiProcessRequestLog = {
  messages: [
    {
      role: COMPUTER_MOUNT_TOOL_RESULT_ROLE,
      content: [
        { type: "image" },
        { type: COMPUTER_MOUNT_TEXT, text: "primeiro" },
        { type: COMPUTER_MOUNT_TEXT, text: "segundo" },
      ],
    },
  ],
}

export const COMPUTER_MOUNT_RESULT_EMPTY: PiProcessRequestLog = {
  messages: [...COMPUTER_MOUNT_RESULT_LAST.messages, { role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: [] }],
}

export const COMPUTER_MOUNT_RESULT_EMPTY_FIRST: PiProcessRequestLog = {
  messages: [
    {
      role: COMPUTER_MOUNT_TOOL_RESULT_ROLE,
      content: [
        { type: COMPUTER_MOUNT_TEXT, text: "" },
        { type: COMPUTER_MOUNT_TEXT, text: "segundo" },
      ],
    },
  ],
}

export const COMPUTER_MOUNT_RESULT_ABSENT_TEXT: PiProcessRequestLog = {
  messages: [
    {
      role: COMPUTER_MOUNT_TOOL_RESULT_ROLE,
      content: [{ type: COMPUTER_MOUNT_TEXT }, { type: COMPUTER_MOUNT_TEXT, text: "segundo" }],
    },
  ],
}

export const COMPUTER_MOUNT_RESULT_STRING: PiProcessRequestLog = {
  messages: [
    ...COMPUTER_MOUNT_RESULT_LAST.messages,
    { role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: "texto direto" },
  ],
}

export const COMPUTER_MOUNT_RESULT_NON_TEXT: PiProcessRequestLog = {
  messages: [
    ...COMPUTER_MOUNT_RESULT_LAST.messages,
    { role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: [{ type: "image" }] },
  ],
}

export const COMPUTER_MOUNT_RESULT_NO_MESSAGE: PiProcessRequestLog = {
  messages: [{ role: "assistant", content: "sem resultado" }],
}

export const COMPUTER_MOUNT_RESULT_WHITESPACE: PiProcessRequestLog = {
  messages: [{ role: COMPUTER_MOUNT_TOOL_RESULT_ROLE, content: [{ type: COMPUTER_MOUNT_TEXT, text: " " }] }],
}

export const COMPUTER_MOUNT_RESULT_RECOVERY: PiProcessRequestLog = {
  messages: [...COMPUTER_MOUNT_RESULT_EMPTY.messages, ...COMPUTER_MOUNT_RESULT_FIRST.messages],
}
