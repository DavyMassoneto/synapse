export const ROUTER_PRIVATE_KEY_PATTERN = /-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g

export const ROUTER_CREDENTIAL_PATTERN = /\b(?:sk-[\w-]{12,}|gh[pousr]_[\w]{12,}|eyJ[\w-]+\.[\w-]+\.[\w-]+)\b/g

export const ROUTER_NAMED_SECRET_PATTERN =
  /((?:authorization|api[_-]?key|password|secret|token)["']?\s*[:=]\s*["']?)(?:Bearer\s+)?[^\s"',;}]+/gi

export const ROUTER_VAULT_PATTERN = /op:\/\/[^\s"']+/g

export const ROUTER_PRIVATE_KEY_REMOVED = "[chave privada removida]"

export const ROUTER_CREDENTIAL_REMOVED = "[credencial removida]"

export const ROUTER_NAMED_SECRET_REMOVED = "$1[credencial removida]"

export const ROUTER_VAULT_REMOVED = "[referência ao cofre removida]"
