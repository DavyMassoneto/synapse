import { rmSync } from "node:fs";

export function cleanupTemporary(path: string): void {
  try {
    rmSync(path, { force: true });
  } catch {
    // Cleanup must not replace the original write failure.
  }
}
