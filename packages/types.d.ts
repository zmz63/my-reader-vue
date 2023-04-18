// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

module '*.frag' {
  const module: string
  export default module
}

module '*.vert' {
  const module: string
  export default module
}

module '*.wasm' {
  const module: string
  export default module
}

module '*.sql' {
  const module: string
  export default module
}

module '*?node-worker' {
  import type { Worker } from 'worker_threads'
  const module: (options?: WorkerOptions) => Worker
  export default module
}

module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const module: ComponentOptions
  export default module
}

declare const __DEV__: boolean

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type Simplify<T> = {
  [P in keyof T]: T[P]
}

type PartialKey<T, U extends keyof T = keyof T> = Simplify<
  { [P in U]?: T[P] } & { [P in keyof T as P extends U ? never : P]-?: T[P] }
>

type RequiredKey<T, U extends keyof T = keyof T> = Simplify<
  { [P in U]-?: T[P] } & { [P in keyof T as P extends U ? never : P]?: T[P] }
>

type FixedArray<T, L extends number = 1, A extends T[] = []> = A['length'] extends L
  ? A
  : FixedArray<T, L, [...A, T]>
