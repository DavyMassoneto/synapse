export function isErrorWithCode(error: Error, code: string): boolean {
  return "code" in error && error.code === code
}
