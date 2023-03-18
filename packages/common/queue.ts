/* eslint-disable @typescript-eslint/no-explicit-any */
import { Defer } from './defer'

export class Queue {
  private context: any

  private queue: (Promise<any> | (() => Promise<any>))[] = []

  private running = false

  private defer = new Defer<void>()

  constructor(context?: any) {
    this.context = context || this
  }

  enqueue<T>(task: Promise<T>): Promise<T>

  enqueue<T extends (...args: any) => any>(task: T, ...args: Parameters<T>): Promise<ReturnType<T>>

  enqueue(task: Promise<any> | ((...args: any) => any), ...args: any) {
    let promise: Promise<any>
    if (typeof task === 'function') {
      const defer = new Defer<any>()
      promise = defer.promise

      this.queue.push(() => {
        try {
          const result = task.apply(this.context, args)
          defer.resolve(result)
        } catch (error) {
          defer.reject()
        }

        return promise
      })
    } else {
      promise = task

      this.queue.push(task)
    }

    if (!this.running) {
      this.run()
    }

    return promise
  }

  dequeue() {
    if (!this.queue.length) {
      return Promise.resolve()
    }

    return this.queue.shift()
  }

  run() {
    if (!this.running) {
      this.running = true
      this.defer = new Defer<void>()
    }

    requestAnimationFrame(() => {
      if (this.queue.length) {
        const task = this.dequeue() as typeof this.queue[0]
        let promise: Promise<any>
        if (typeof task === 'function') {
          promise = task()
        } else {
          promise = task
        }

        promise.then(() => this.run()).catch(() => this.run())
      } else {
        this.defer.resolve()
        this.running = false
      }
    })

    return this.defer.promise
  }
}
