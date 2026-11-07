import type { SessionProjection } from "@earendil-works/pi-coding-agent";
import type { AdvisorSession } from "#synapse/integration";
import type { ProjectedMessages } from "./test-context-types";

export class TestSession implements AdvisorSession {
  projectionError = false;
  messages: ProjectedMessages = [];
  buildSessionProjection(): SessionProjection {
    if (this.projectionError) {
      throw new Error("projection failed");
    }
    return { entries: [], messages: this.messages, thinkingLevel: "off", model: null };
  }
}
