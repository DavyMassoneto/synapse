import { type ComputerDriverLaunch } from "#synapse/modules/computer-use/public/contracts"

export type LifecycleLaunchResolver = (launch: ComputerDriverLaunch) => void

export type LifecycleStartResolver = (
  tools: import("#synapse/modules/computer-use/public/contracts").ComputerDriverTool[],
) => void

export type LifecycleCallResolver = (
  result: import("#synapse/modules/computer-use/public/contracts").ComputerDriverCallResult,
) => void

export type LifecycleReadStartedResolver = () => void
