import { type Advisor, createAdvisor } from "@/modules";

export function compose(): Advisor {
  return createAdvisor();
}
