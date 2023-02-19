import { Defer } from './defer'

type QueueItem = {
  task?: (...args: unknown[]) => unknown
  args?: unknown[]
  defer?: Defer<unknown>
  promise: Promise<unknown>
}

export class Queue {
  private context: unknown

  private queue: QueueItem[] = []

  private running = false

  defer = new Defer<void>()

  constructor(context?: unknown) {
    this.context = context || this
  }

  enqueue<T>(task: Promise<T>): Promise<T>

  enqueue<T extends (...args: unknown[]) => unknown>(
    task: T,
    ...args: Parameters<T>
  ): Promise<ReturnType<T>>

  enqueue(task: Promise<unknown> | ((...args: unknown[]) => unknown), ...args: unknown[]) {
    let item: QueueItem

    if (typeof task === 'function') {
      const defer = new Defer<unknown>()
      item = {
        task,
        args,
        defer,
        promise: defer.promise
      }
    } else {
      item = {
        promise: task
      }
    }

    this.queue.push(item)

    if (!this.running) {
      this.run()
    }

    return item.promise
  }

  dequeue() {
    if (!this.queue.length) {
      return Promise.resolve()
    }

    const item = this.queue.shift() as Required<QueueItem>
    const task = item.task

    if (task) {
      const result = task.apply(this.context, item.args)

      if (result instanceof Promise) {
        return result.then((value: unknown) => item.defer.resolve(value))
      } else {
        item.defer.resolve(result)
        return item.promise
      }
    } else if (item.promise) {
      return item.promise
    } else {
      return Promise.resolve()
    }
  }

  run() {
    if (!this.running) {
      this.running = true
      this.defer = new Defer<void>()
    }

    requestAnimationFrame(() => {
      if (this.queue.length) {
        this.dequeue()
          .then(() => this.run())
          .catch((reason: unknown) => {
            this.defer.reject(reason)
            this.running = false
          })
      } else {
        this.defer.resolve()
        this.running = false
      }
    })

    return this.defer.promise
  }
}
