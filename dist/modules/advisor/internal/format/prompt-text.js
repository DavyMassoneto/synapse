"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT_SUFFIX = exports.TRANSCRIPT_PREFIX = exports.PROMPT_PREFIX = void 0;
exports.PROMPT_PREFIX = "<executor_system_prompt>\n";
exports.TRANSCRIPT_PREFIX = "\n</executor_system_prompt>\n\n<transcript>\n";
exports.PROMPT_SUFFIX = "\n</transcript>\n\nThe executor just called advisor(). Give your guidance now.";
