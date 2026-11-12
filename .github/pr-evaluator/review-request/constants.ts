import { MAX_OUTPUT_TOKENS, MODEL_CONTEXT_TOKENS } from "#evaluator/review-configuration"

export const TEMPLATE_FILE = "docs/pr-evaluator.md"

export const ARCHITECTURE_FILE = "docs/architecture.md"

export const RULES_FILE = "AGENTS.md"

export const STANDARDS_DIRECTORY = "docs/standards"

export const MARKDOWN_EXTENSION = ".md"

export const STANDARD_BREAK = "\n\n"

export const TEMPLATE_PATTERN = /```text\n([\s\S]*?)\n```/

export const PLACEHOLDER_ARCHITECTURE = "{{ARQUITETURA}}"

export const PLACEHOLDER_RULES = "{{REGRAS}}"

export const PLACEHOLDER_STANDARDS = "{{PADROES}}"

export const PROMPT_TOO_LARGE = "As regras e os documentos excedem o limite do prompt; nenhuma review foi publicada."

export const MIN_BYTES_PER_TOKEN = 1

export const MAX_PROMPT_BYTES = (MODEL_CONTEXT_TOKENS - MAX_OUTPUT_TOKENS) * MIN_BYTES_PER_TOKEN

export const PROMPT_ENCODING = "utf8"

export const PLACEHOLDER_PATTERN = /\{\{(?:ARQUITETURA|REGRAS|PADROES)\}\}/g
