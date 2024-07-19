import { MockInstance } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: any[]) => any;

export function typeAsSpyInstance<T extends Procedure>(
  fn: T,
): MockInstance<Parameters<T>, ReturnType<T>> {
  return fn as unknown as MockInstance<Parameters<typeof fn>, ReturnType<typeof fn>>;
}
