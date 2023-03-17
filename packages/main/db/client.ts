import type { Worker } from 'worker_threads'
import createWorker from './worker?node-worker'

export class Client {
  worker: Worker

  constructor() {
    this.worker = createWorker()

    // this.worker.on('message')
  }
}
