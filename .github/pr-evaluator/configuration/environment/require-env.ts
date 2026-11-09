export function requireEnv(name: string): string {
  const value = process.env[name]
  if (typeof value === "string" && value.length > 0) {
    return value
  }
  throw new Error(`Variável de ambiente ausente: ${name}`)
}
