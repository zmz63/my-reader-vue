import { parentPort } from 'worker_threads'
import { Server } from './server'

export type WorkerMessagePayload = {
  type: string
  data: unknown
}

if (!parentPort) {
  throw new Error('')
}

const port = parentPort

const server = new Server()

port.on('message', () => {
  try {
    port.postMessage('')
  } catch (error) {
    port.postMessage('')
  }
})
