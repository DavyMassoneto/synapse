export interface ComputerUnityBridgeCommand {
  command: string
  arguments: string[]
}

export interface ComputerUnityBridgeConfiguration {
  handshakeDirectory: string
  unityProbe?: ComputerUnityBridgeCommand
  attachCommand?: ComputerUnityBridgeCommand
}
