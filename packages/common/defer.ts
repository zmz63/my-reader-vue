/* eslint-disable @typescript-eslint/no-explicit-any */
export class Defer<T> {
  promise: Promise<T>

  resolve!: (value: T | PromiseLike<T>) => void

  reject!: (reason?: any) => void

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
