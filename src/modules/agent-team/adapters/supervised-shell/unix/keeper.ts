import { awaitKeeperRelease, readKeeperSpec } from "./keeper-reading"
import { UnixKeeper } from "./keeper-runtime"

function startKeeper(): void {
  const keeper = new UnixKeeper(readKeeperSpec())
  keeper.announce()
  awaitKeeperRelease()
  keeper.release()
}

startKeeper()
