import { MockInstance } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Procedure = (...args: any[]) => any;

export function typeAsMockInstance<T extends Procedure>(fn: T): MockInstance<T> {
  return fn as unknown as MockInstance<T>;
}
