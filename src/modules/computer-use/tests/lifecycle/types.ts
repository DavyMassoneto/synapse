import {
  type ComputerDriverCallResult,
  type ComputerDriverLaunch,
  type ComputerDriverTool,
} from "#synapse/modules/computer-use/public/contracts"

export type LifecycleLaunchResolver = (launch: ComputerDriverLaunch) => void

export type LifecycleStartResolver = (tools: ComputerDriverTool[]) => void

export type LifecycleCallResolver = (result: ComputerDriverCallResult) => void

export type LifecycleReadStartedResolver = () => void
