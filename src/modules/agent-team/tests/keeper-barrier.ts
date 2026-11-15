import { readSync, writeSync } from "node:fs"
import { SHELL_KEEPER_BARRIER_FD } from "./constants"

writeSync(1, Buffer.from([5]))
readSync(SHELL_KEEPER_BARRIER_FD, Buffer.alloc(1))
