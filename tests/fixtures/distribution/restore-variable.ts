export function restoreVariable(name: string, previous?: string): void {
  if (typeof previous === "string") {
    process.env[name] = previous
  } else {
    delete process.env[name]
  }
}
