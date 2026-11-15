import { describe, expect, test, vi } from "vitest"
import {
  IPHONE_WDA_DEFAULT_BIND_HOSTS,
  IPHONE_WDA_ENDPOINT_BUSY,
  IPHONE_WDA_LINUX,
  IPHONE_WDA_LINUX_BIND_HOSTS,
  IphoneWdaAdmission,
  type IphoneWdaAdmissions,
  IphoneWdaSocket,
} from "#synapse/modules/iphone/adapters/wda-admission"
import { MjpegBindGate } from "./mjpeg-bind-gate"
import * as texts from "./mjpeg-constants"
import { IPHONE_TEST_WDA_BIND_METHOD, IPHONE_TEST_WDA_CLOSE_METHOD } from "./wda-bind-plan-constants"

async function excludesCrossRole(): Promise<void> {
  const owners: IphoneWdaAdmissions = new Set()
  const first = new IphoneWdaAdmission([54321, 54322], owners)
  const second = new IphoneWdaAdmission([54322, 54323], owners)
  const signal = new AbortController().signal
  vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD).mockResolvedValue()
  vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD).mockResolvedValue()
  try {
    await first.reserve(signal)
    await first.handoff(signal)
    await expect(second.reserve(signal)).rejects.toThrow(IPHONE_WDA_ENDPOINT_BUSY)
    await second.release()
    expect(owners.size).toBe(1)
    await first.release()
    const next = new IphoneWdaAdmission([54322, 54323], owners)
    await next.reserve(signal)
    await first.release()
    expect(owners.size).toBe(1)
    await next.release()
  } finally {
    await first.release()
    await second.release()
    vi.restoreAllMocks()
  }
}

async function rejectsWithoutPartialLease(): Promise<void> {
  const owners: IphoneWdaAdmissions = new Set()
  const first = new IphoneWdaAdmission([54321, 54322], owners)
  const conflict = new IphoneWdaAdmission([54323, 54322], owners)
  const independent = new IphoneWdaAdmission([54323], owners)
  const signal = new AbortController().signal
  vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD).mockResolvedValue()
  vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD).mockResolvedValue()
  try {
    await first.reserve(signal)
    await expect(conflict.reserve(signal)).rejects.toThrow(IPHONE_WDA_ENDPOINT_BUSY)
    await independent.reserve(signal)
    expect(owners.size).toBe(2)
  } finally {
    await first.release()
    await conflict.release()
    await independent.release()
    vi.restoreAllMocks()
  }
}

async function releasesFailedSecondPort(): Promise<void> {
  const owners: IphoneWdaAdmissions = new Set()
  const first = new IphoneWdaAdmission([54321, 54322], owners)
  const bind = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD)
  const close = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD).mockResolvedValue()
  const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
  for (const _host of hosts) {
    bind.mockResolvedValueOnce()
  }
  bind.mockRejectedValueOnce(new Error(IPHONE_WDA_ENDPOINT_BUSY))
  try {
    await expect(first.reserve(new AbortController().signal)).rejects.toThrow(IPHONE_WDA_ENDPOINT_BUSY)
    expect(owners.size).toBe(0)
    expect(close).toHaveBeenCalledTimes(hosts.length + 1)
    bind.mockResolvedValue()
    const next = new IphoneWdaAdmission([54321, 54322], owners)
    await next.reserve(new AbortController().signal)
    await first.release()
    expect(owners.size).toBe(1)
    await next.release()
  } finally {
    await first.release()
    vi.restoreAllMocks()
  }
}

async function cancelsSecondPort(): Promise<void> {
  const owners: IphoneWdaAdmissions = new Set()
  const first = new IphoneWdaAdmission([54321, 54322], owners)
  const hosts = process.platform === IPHONE_WDA_LINUX ? IPHONE_WDA_LINUX_BIND_HOSTS : IPHONE_WDA_DEFAULT_BIND_HOSTS
  const gate = new MjpegBindGate(hosts.length + 1)
  const bind = vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_BIND_METHOD).mockImplementation(gate.bind.bind(gate))
  vi.spyOn(IphoneWdaSocket.prototype, IPHONE_TEST_WDA_CLOSE_METHOD).mockResolvedValue()
  try {
    const reserving = first.reserve(new AbortController().signal)
    const rejected = expect(reserving).rejects.toThrow()
    await gate.entered.promise
    expect(bind).toHaveBeenCalledTimes(hosts.length + 1)
    await first.release()
    gate.released.resolve()
    await rejected
    expect(owners.size).toBe(0)
    bind.mockResolvedValue()
    const next = new IphoneWdaAdmission([54321, 54322], owners)
    await next.reserve(new AbortController().signal)
    await first.release()
    expect(owners.size).toBe(1)
    await next.release()
  } finally {
    gate.released.resolve()
    await first.release()
    vi.restoreAllMocks()
  }
}

function suite(): void {
  test(texts.IPHONE_TEST_MJPEG_CANCEL, cancelsSecondPort)
  test(texts.IPHONE_TEST_MJPEG_LEASE, excludesCrossRole)
  test(texts.IPHONE_TEST_MJPEG_ROLLBACK, rejectsWithoutPartialLease)
  test(texts.IPHONE_TEST_MJPEG_PARTIAL, releasesFailedSecondPort)
}

describe(texts.IPHONE_TEST_MJPEG_ADMISSION_SUITE, suite)
