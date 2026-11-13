import { type ComputerDriverProcess } from "../adapters"
import { type ComputerActionDispatch, type ComputerDriverSession } from "../internal"
import { type ComputerDriverLaunch } from "../public"
import { type ComputerTestWait } from "./doubles"

export interface ComputerDispatchTestSut extends ComputerProcessTestSut {
  dispatch: ComputerActionDispatch
  wait: ComputerTestWait
}

export interface ComputerProcessTestSut {
  driver: ComputerDriverProcess
  session: ComputerDriverSession
  directory: string
  log: string
  launch: ComputerDriverLaunch
}
