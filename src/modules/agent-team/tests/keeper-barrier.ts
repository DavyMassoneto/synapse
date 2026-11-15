import { readSync, writeSync } from "node:fs"
import { SHELL_KEEPER_BARRIER_FD } from "./constants"
import { SHELL_BARRIER_READY_BYTE, SHELL_BARRIER_READY_FD } from "./native-scenario-constants"

writeSync(SHELL_BARRIER_READY_FD, Buffer.from([SHELL_BARRIER_READY_BYTE]))
readSync(SHELL_KEEPER_BARRIER_FD, Buffer.alloc(1))
