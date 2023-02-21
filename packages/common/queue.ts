import { Defer } from './defer'

export class Queue {
  private context: unknown

  private queue: {
    task: Promise<unknown> | (() => Promise<unknown>)
    necessary: boolean
  }[] = []

  private running = false

  defer = new Defer<void>()

  constructor(context?: unknown) {
    this.context = context || this
  }

  enqueue<T>(task: Promise<T>, necessary?: boolean): Promise<T>

  enqueue<T extends (...args: unknown[]) => unknown>(
    task: T,
    necessary?: boolean,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>>

  enqueue(
    task: Promise<unknown> | ((...args: unknown[]) => unknown),
    necessary = false,
    ...args: unknown[]
  ) {
    let promise: Promise<unknown>
    if (typeof task === 'function') {
      const defer = new Defer<unknown>()
      promise = defer.promise
      this.queue.push({
        task: () => {
          try {
            const result = task.apply(this.context, args)
            defer.resolve(result)
          } catch (error) {
            defer.reject()
          }
          return promise
        },
        necessary
      })
    } else {
      promise = task
      this.queue.push({ task, necessary })
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
        const item = this.dequeue() as typeof this.queue[0]
        let promise: Promise<unknown>
        if (typeof item.task === 'function') {
          promise = item.task()
        } else {
          promise = item.task
        }

        promise
          .then(() => this.run())
          .catch((reason: unknown) => {
            if (item.necessary) {
              this.defer.reject(reason)
              this.running = false
            } else {
              this.run()
            }
          })
      } else {
        this.defer.resolve()
        this.running = false
      }
    })

    return this.defer.promise
  }
}
