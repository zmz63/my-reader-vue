/* eslint-disable @typescript-eslint/no-explicit-any */
import { parentPort } from 'worker_threads'
import { Server } from './server'

export type WorkerRequestPayload = {
  seq: number
  type: string
  data: any
}

export type WorkerResponsePayload = {
  seq: number
  code: 0 | 1
  data: any
}

if (!parentPort) {
  throw new Error('')
}

const port = parentPort

const server = new Server()

port.on('message', (request: WorkerRequestPayload) => {
  const { seq, type, data } = request
  let response: WorkerResponsePayload

  try {
    response = {
      seq,
      code: 0,
      data: server.process(type, data)
    }
    port.postMessage(response)
  } catch (error) {
    response = {
      seq,
      code: 1,
      data: error
    }
    port.postMessage(response)
  }
})

port.on('close', () => {
  server.close()
})
