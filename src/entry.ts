import { compose } from "#synapse/composition/index.js";
import { PiHost, type PiInstance } from "#synapse/integration/index.js";

export default function registerSynapse(pi: PiInstance): void {
  compose(new PiHost(pi));
}
