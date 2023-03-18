/* eslint-disable @typescript-eslint/no-explicit-any */
export function assert(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
