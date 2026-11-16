import { type ShellProbeUnicodeFixture } from "./types"

export const SHELL_PROBE_UNICODE_FIXTURES: ShellProbeUnicodeFixture[] = [
  { name: "prefixo ASCII encerra antes do emoji", input: `${"x".repeat(2047)}😀tail`, expected: "x".repeat(2047) },
  { name: "caracteres de dois bytes", input: "é".repeat(3000), expected: "é".repeat(1024) },
  { name: "caracteres de quatro bytes", input: "😀".repeat(3000), expected: "😀".repeat(512) },
]
