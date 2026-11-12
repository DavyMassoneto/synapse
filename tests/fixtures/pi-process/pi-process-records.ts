import { EventEmitter, once } from "node:events"
import { Value } from "typebox/value"
import { isPiProcessRecordMatch, type PiProcessMatch } from "../pi-process-matching"
import {
  PI_PROCESS_RECORD_EVENT,
  PI_PROCESS_RECORD_SCHEMA,
  PI_PROCESS_SEARCH_FOUND,
  PI_PROCESS_SEARCH_PENDING,
  PI_PROCESS_TIMEOUT_FAILURE,
} from "./constants"
import { PiProcessLineFramer } from "./line-framer"
import { type PiProcessResponse, type PiProcessSearch } from "./types"

export class PiProcessRecords {
  private readonly responses: PiProcessResponse[] = []

  private readonly events = new EventEmitter()

  private readonly framer = new PiProcessLineFramer()

  private failure?: Error

  async waitFor(match: PiProcessMatch, timeoutMs: number): Promise<PiProcessResponse> {
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

  private search(match: PiProcessMatch, offset: number): PiProcessSearch {
    while (offset < this.responses.length) {
      const response = this.responses[offset]
      offset += 1
      if (response && isPiProcessRecordMatch(response.record, match)) {
        return { kind: PI_PROCESS_SEARCH_FOUND, response }
      }
    }
    return { kind: PI_PROCESS_SEARCH_PENDING, offset }
  }

  receive(chunk: string): void {
    try {
      for (const line of this.framer.append(chunk)) {
        const record = Value.Parse(PI_PROCESS_RECORD_SCHEMA, JSON.parse(line))
        this.responses.push({ record, line })
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
