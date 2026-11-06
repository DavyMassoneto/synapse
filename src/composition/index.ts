import type { Advisor } from "@/modules/advisor/public/contracts.ts";
import { createAdvisor } from "@/modules/advisor/public/index.ts";

export function compose(): Advisor {
  return createAdvisor();
}
