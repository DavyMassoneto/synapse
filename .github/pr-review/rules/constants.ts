import { fileURLToPath } from "node:url"

export const RULES_DIR = fileURLToPath(new URL("../prompts/rules", import.meta.url))
export const RULES_SUFFIX = ".md"
export const GROUP_NAMES = ["code", "design", "delivery"]
export const RULE_PATTERN = /^- \*\*([A-Z]\d{2}) ([A-Z_]+)\./gm
