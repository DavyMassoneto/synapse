import { compose } from "#synapse/composition";
import { PiHost, type PiInstance } from "#synapse/integration";

export default function registerSynapse(pi: PiInstance): void {
  compose(new PiHost(pi));
}
