/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcRenderer } from 'electron'
import type { RunResult } from 'better-sqlite3'

export function invokeDB(type: 'run', source: string, params?: any[]): Promise<RunResult>
export function invokeDB<T>(type: 'get', source: string, params?: any[]): Promise<T>
export function invokeDB<T>(type: 'all', source: string, params?: any[]): Promise<T[]>
export function invokeDB(type: 'run' | 'get' | 'all', source: string, params?: any[]) {
  return ipcRenderer.invoke(`db:${type}`, { source, params })
}

export * from './book'
export * from './highlight'
