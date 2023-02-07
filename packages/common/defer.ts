/* eslint-disable @typescript-eslint/no-explicit-any */
export class Defer {
  promise: Promise<void>

  resolve: ((value: void | PromiseLike<void>) => void) | null = null

  reject: ((reason?: any) => void) | null = null

  constructor() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
