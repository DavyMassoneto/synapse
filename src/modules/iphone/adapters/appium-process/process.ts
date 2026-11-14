import { type ChildProcess, spawn } from "node:child_process"
import { closeSync, mkdirSync, openSync } from "node:fs"
import { join } from "node:path"
import { type IphoneHost } from "#synapse/modules/iphone/public/contracts"
import { iphoneAppiumCommand } from "./command"
import {
  IPHONE_APPIUM_DEFAULT_PORT,
  IPHONE_APPIUM_ERROR_EVENT,
  IPHONE_APPIUM_EXIT_EVENT,
  IPHONE_APPIUM_FORCE_SIGNAL,
  IPHONE_APPIUM_LOCAL_NAMES,
  IPHONE_APPIUM_LOG_APPEND,
  IPHONE_APPIUM_LOG_FILE,
  IPHONE_APPIUM_LOG_OPTION,
  IPHONE_APPIUM_NODE_SCRIPT_EXTENSION,
  IPHONE_APPIUM_PORT_OPTION,
  IPHONE_APPIUM_REMOTE,
  IPHONE_APPIUM_SHUTDOWN_MS,
  IPHONE_APPIUM_SIGNAL,
  IPHONE_APPIUM_STARTED,
  IPHONE_APPIUM_WINDOWS,
  IPHONE_APPIUM_WINDOWS_SHELL,
} from "./constants"
import { iphoneAppiumEnvironment } from "./environment"
import { findIphoneAppium } from "./find"
import { terminateIphoneAppiumTree } from "./terminate-tree"
import {
  type IphoneAppiumExecutor,
  type IphoneAppiumResolve,
  type IphoneAppiumStartResult,
  type IphoneAppiumTimer,
} from "./types"

export class IphoneAppiumProcess {
  private readonly executor: IphoneAppiumExecutor

  private child?: ChildProcess

  private host?: IphoneHost

  constructor(executor: IphoneAppiumExecutor) {
    this.executor = executor
  }

  start(
    serverUrl: string,
    stateDirectory: string,
    path: string,
    host: IphoneHost,
    appiumHome?: string,
    executable?: string,
  ): IphoneAppiumStartResult {
    const url = new URL(serverUrl)
    if (!IPHONE_APPIUM_LOCAL_NAMES.includes(url.hostname)) {
      return { kind: IPHONE_APPIUM_REMOTE }
    }
    if (!this.child) {
      this.host = host
      this.launch(url, stateDirectory, path, host, appiumHome, executable)
    }
    return { kind: IPHONE_APPIUM_STARTED }
  }

  async stop(): Promise<void> {
    const child = this.child
    if (child) {
      delete this.child
      await new Promise<void>(this.terminate.bind(this, child))
    }
  }

  private launch(
    url: URL,
    stateDirectory: string,
    path: string,
    host: IphoneHost,
    appiumHome?: string,
    resolvedExecutable?: string,
  ): void {
    const executable = resolvedExecutable || findIphoneAppium(path, host)
    const port = url.port.length > 0 ? url.port : IPHONE_APPIUM_DEFAULT_PORT
    this.spawnLogged(executable, port, host, this.openLog(stateDirectory), appiumHome)
  }

  private openLog(stateDirectory: string): number {
    mkdirSync(stateDirectory, { recursive: true })
    return openSync(join(stateDirectory, IPHONE_APPIUM_LOG_FILE), IPHONE_APPIUM_LOG_APPEND)
  }

  private spawnLogged(
    executable: string,
    port: string,
    host: IphoneHost,
    descriptor: number,
    appiumHome?: string,
  ): void {
    try {
      this.spawn(executable, port, host, descriptor, appiumHome)
    } finally {
      closeSync(descriptor)
    }
  }

  private spawn(executable: string, port: string, host: IphoneHost, descriptor: number, appiumHome?: string): void {
    const argumentsValue = [IPHONE_APPIUM_PORT_OPTION, port, IPHONE_APPIUM_LOG_OPTION]
    const launch = executable.endsWith(IPHONE_APPIUM_NODE_SCRIPT_EXTENSION)
      ? { command: process.execPath, arguments: [executable, ...argumentsValue] }
      : iphoneAppiumCommand(executable, argumentsValue, host)
    const child = spawn(launch.command, launch.arguments, {
      stdio: ["ignore", descriptor, descriptor],
      windowsHide: host === IPHONE_APPIUM_WINDOWS,
      windowsVerbatimArguments: launch.command === IPHONE_APPIUM_WINDOWS_SHELL,
      env: iphoneAppiumEnvironment(appiumHome),
    })
    this.child = child
    child.once(IPHONE_APPIUM_ERROR_EVENT, this.finish.bind(this, child))
    child.once(IPHONE_APPIUM_EXIT_EVENT, this.finish.bind(this, child))
  }

  private finish(child: ChildProcess): void {
    if (this.child === child) {
      delete this.child
    }
  }

  private terminate(child: ChildProcess, resolve: IphoneAppiumResolve): void {
    const timer = setTimeout(this.force.bind(this, child, resolve), IPHONE_APPIUM_SHUTDOWN_MS)
    child.once(IPHONE_APPIUM_EXIT_EVENT, this.settleTermination.bind(this, timer, resolve))
    this.requestTermination(child)
  }

  private requestTermination(child: ChildProcess): void {
    if (this.host === IPHONE_APPIUM_WINDOWS && child.pid) {
      void this.terminateTree(child)
    } else {
      child.kill(IPHONE_APPIUM_SIGNAL)
    }
  }

  private async terminateTree(child: ChildProcess): Promise<void> {
    const pid = child.pid
    if (pid) {
      try {
        await terminateIphoneAppiumTree(pid, this.executor)
      } catch (error) {
        if (error instanceof Error) {
          child.kill(IPHONE_APPIUM_FORCE_SIGNAL)
        } else {
          throw error
        }
      }
    }
  }

  private force(child: ChildProcess, resolve: IphoneAppiumResolve): void {
    child.kill(IPHONE_APPIUM_FORCE_SIGNAL)
    resolve()
  }

  private settleTermination(timer: IphoneAppiumTimer, resolve: IphoneAppiumResolve): void {
    clearTimeout(timer)
    resolve()
  }
}
