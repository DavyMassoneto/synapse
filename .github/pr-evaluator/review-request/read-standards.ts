import { formatStandard } from "./format-standard"
import { listStandardFiles } from "./list-standard-files"

export function readStandards(root: string): string {
  return listStandardFiles(root)
    .map((name) => formatStandard(root, name))
    .join("\n\n")
}
