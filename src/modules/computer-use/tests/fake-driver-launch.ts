import { fileURLToPath } from "node:url"

export function computerFakeDriverArguments(): string[] {
  return [
    "--import",
    import.meta.resolve("tsx"),
    fileURLToPath(new URL("./fake-driver/fake-driver.ts", import.meta.url)),
  ]
}
