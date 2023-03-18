/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Worker } from 'worker_threads'
import { Defer } from '@common/defer'
import createWorker from './worker?node-worker'
import type { WorkerRequestPayload, WorkerResponsePayload } from './worker'

export class Client {
  worker: Worker

  seq = 0

  map: Map<number, Defer<any>> = new Map()

  constructor() {
    this.worker = createWorker()

    this.worker.on('message', (response: WorkerResponsePayload) => {
      const { seq, code, data } = response
      const defer = this.map.get(seq)

      if (defer) {
        if (code === 0) {
          defer.resolve(data)
        } else {
          defer.reject(data)
        }

        this.map.delete(seq)
      }
    })

    const errorCallback = (message: any) => {
      for (const defer of this.map.values()) {
        defer.reject(message)
      }

      this.map.clear()
    }

    this.worker.on('error', errorCallback)
    this.worker.on('exit', errorCallback)
  }

  request<T>(type: string, data?: any) {
    const payload: WorkerRequestPayload = {
      seq: this.seq++,
      type,
      data
    }
    const defer = new Defer<T>()

    this.map.set(payload.seq, defer)

    this.worker.postMessage(payload)

    return defer.promise
  }
}
