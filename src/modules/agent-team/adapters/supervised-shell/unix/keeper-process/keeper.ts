import { UNIX_KEEPER_INVALID, UNIX_NATIVE_EXECUTABLE_ARGUMENT } from "./constants"
import { readKeeperSpec } from "./keeper-reading"
import { UnixKeeper } from "./keeper-runtime"

function startKeeper(): void {
  const executable = process.argv[UNIX_NATIVE_EXECUTABLE_ARGUMENT]
  if (!executable) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
  new UnixKeeper(readKeeperSpec(), executable).run()
}

startKeeper()
