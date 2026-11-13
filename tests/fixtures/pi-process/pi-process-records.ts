import { EventEmitter, once } from "node:events"
import { Value } from "typebox/value"
import {
  PI_PROCESS_RECORD_EVENT,
  PI_PROCESS_SEARCH_FOUND,
  PI_PROCESS_SEARCH_PENDING,
  PI_PROCESS_TIMEOUT_FAILURE,
  PI_PROCESS_UI_MATCHES,
  PI_PROCESS_UI_REQUEST_TYPE,
  PI_PROCESS_UI_RESPONSE_MISSING,
} from "./constants"
import { PiProcessLineFramer } from "./line-framer"
import { isPiProcessRecordMatch } from "./predicates"
import { PI_PROCESS_RECORD_SCHEMA } from "./schemas"
import {
  type PiProcessMatch,
  type PiProcessNotice,
  type PiProcessRecord,
  type PiProcessSearch,
  type PiProcessStatus,
  type PiProcessUiEvent,
  type PiProcessUiMethod,
} from "./types"

export class PiProcessRecords {
  private readonly responses: PiProcessRecord[] = []

  private readonly events = new EventEmitter()

  private readonly framer = new PiProcessLineFramer()

  private failure?: Error

  async waitFor(match: PiProcessMatch, timeoutMs: number): Promise<PiProcessRecord> {
    const signal = AbortSignal.timeout(timeoutMs)
    let offset = 0
    while (true) {
      if (this.failure) {
        throw this.failure
      }
      const search = this.search(match, offset)
      if (search.kind === PI_PROCESS_SEARCH_FOUND) {
        return search.response
      }
      offset = search.offset
      try {
        await once(this.events, PI_PROCESS_RECORD_EVENT, {
          signal,
        })
      } catch (error) {
        if (signal.aborted) {
          throw new Error(`${PI_PROCESS_TIMEOUT_FAILURE}${JSON.stringify(match)}`)
        }
        throw error
      }
    }
  }

  waitForUi(method: "setStatus", timeoutMs: number): Promise<PiProcessStatus>
  waitForUi(method: "notify", timeoutMs: number): Promise<PiProcessNotice>
  async waitForUi(method: PiProcessUiMethod, timeoutMs: number): Promise<PiProcessUiEvent> {
    const match = PI_PROCESS_UI_MATCHES[method]
    const record = await this.waitFor(match, timeoutMs)
    if (record.type === PI_PROCESS_UI_REQUEST_TYPE && record.method === method) {
      return record
    }
    throw new Error(PI_PROCESS_UI_RESPONSE_MISSING)
  }

  records(): PiProcessRecord[] {
    return [...this.responses]
  }

  private search(match: PiProcessMatch, offset: number): PiProcessSearch {
    while (offset < this.responses.length) {
      const response = this.responses[offset]
      offset += 1
      if (response && isPiProcessRecordMatch(response, match)) {
        return { kind: PI_PROCESS_SEARCH_FOUND, response }
      }
    }
    return { kind: PI_PROCESS_SEARCH_PENDING, offset }
  }

  receive(chunk: string): void {
    try {
      for (const line of this.framer.append(chunk)) {
        const record = Value.Parse(PI_PROCESS_RECORD_SCHEMA, JSON.parse(line))
        this.responses.push(record)
        this.events.emit(PI_PROCESS_RECORD_EVENT)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.fail(error)
      } else {
        throw error
      }
    }
  }

  fail(error: Error): void {
    this.failure = error
    this.events.emit(PI_PROCESS_RECORD_EVENT)
  }
}
