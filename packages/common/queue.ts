/* eslint-disable @typescript-eslint/no-explicit-any */
import { Defer } from './defer'

type QueueItem = {
  promise: Promise<any>
  task?: (...args: any[]) => any
  context?: any
}

export class Queue {
  queue: QueueItem[] = []

  constructor() {
    //
  }

  enqueue(task: Promise<any> | ((...args: any[]) => any), context?: any) {
    let item: QueueItem

    if (typeof task === 'function') {
      const defer = new Defer()
      item = {
        promise: defer.promise,
        task,
        context
      }
    } else {
      item = {
        promise: task
      }
    }

    this.queue.push(item)
  }
}
