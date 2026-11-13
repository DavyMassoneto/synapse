import { type ComputerDriverArtifacts } from "./types"

export const COMPUTER_DRIVER_ARTIFACTS: ComputerDriverArtifacts = {
  darwin: {
    arm64: {
      fileName: "darwin-universal.tar.gz",
      sha256: "f827a393c0dae24943ddb454d85abb6b592d8636e6a99f6c349f81f5f516975f",
    },
    x64: {
      fileName: "darwin-universal.tar.gz",
      sha256: "f827a393c0dae24943ddb454d85abb6b592d8636e6a99f6c349f81f5f516975f",
    },
  },
  linux: {
    arm64: {
      fileName: "linux-arm64-binary.tar.gz",
      sha256: "6b3a308c6741dd8291aad22a308bd2ec8eb52eab64687be007ac86ceaf7e3307",
    },
    x64: {
      fileName: "linux-x86_64-binary.tar.gz",
      sha256: "cf29bfaad16737e31e72f38dad2a6424f24b21a4ac2edea885e83cb9d5034135",
    },
  },
  win32: {
    arm64: {
      fileName: "windows-arm64-binary.zip",
      sha256: "79caf7e4f55cdab08533abf7ead4038132aa070040669238d806d057f648cc5f",
    },
    x64: {
      fileName: "windows-x86_64-binary.zip",
      sha256: "d63f6a78e65afc06524048f5557fed36cdf01f0a8a680236e93c9a2fb3587f44",
    },
  },
}
