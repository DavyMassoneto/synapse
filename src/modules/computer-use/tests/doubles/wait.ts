import { type ComputerWaitPort } from "#synapse/modules/computer-use/public/contracts"

export class ComputerTestWait implements ComputerWaitPort {
  milliseconds: number[] = []

  async wait(milliseconds: number): Promise<void> {
    this.milliseconds.push(milliseconds)
  }
}
