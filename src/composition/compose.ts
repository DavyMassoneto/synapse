import type { Advisor } from "@/modules";
import { createAdvisor } from "@/modules";

export function compose(): Advisor {
  return createAdvisor();
}
