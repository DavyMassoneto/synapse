export const IPHONE_SIMULATOR_TEST_EXHAUSTED = "O dublê de comandos não tem resposta para esta chamada."

export const BOOTED_SIMULATORS = JSON.stringify({
  devices: {
    "com.apple.CoreSimulator.SimRuntime.iOS-26-6": [
      { udid: "primeiro", name: "iPhone 17", state: "Booted" },
      { udid: "segundo", name: "iPhone 16", state: "Shutdown" },
    ],
    "com.apple.CoreSimulator.SimRuntime.iOS-18-2": [{ udid: "terceiro", name: "iPhone SE", state: "Booted" }],
  },
})

export const WITHOUT_UDID = JSON.stringify({
  devices: { "com.apple.CoreSimulator.SimRuntime.iOS-26-6": [{ udid: 7, name: "iPhone 17" }] },
})

export const COMMAND_TIMEOUT = "xcrun não respondeu"

export const EMPTY_AND_FUTURE_DEVICES = JSON.stringify({
  devices: {
    arbitrary: [
      { udid: "", name: "", state: "Booted" },
      { udid: "future", name: "future", state: "Future" },
      { udid: "empty", name: "empty", state: "" },
    ],
  },
})

export const FINAL_INVALID_GROUP = '{"devices":{"r":[{"udid":"a","name":"a","state":"Booted"}],"s":[{}]}}'
