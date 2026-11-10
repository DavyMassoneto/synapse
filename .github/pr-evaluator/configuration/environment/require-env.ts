import { hasText } from "./predicates"

export function requireEnv(name: string): string {
  const value = process.env[name]
  if (hasText(value)) {
    return value
  }
  throw new Error(`Variável de ambiente ausente: ${name}`)
}
