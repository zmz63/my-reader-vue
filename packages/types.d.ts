// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

declare module '*.frag' {
  const module: string
  export default module
}

declare module '*.vert' {
  const module: string
  export default module
}

declare module '*.wasm' {
  const module: string
  export default module
}

declare module '*.vue' {
  import type { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type Simplify<T> = {
  [P in keyof T]: T[P]
}

type DataChunk<T> = {
  name: string
  data: T
}

type SetPartial<T, U extends keyof T> = Simplify<
  { [P in U]?: T[P] } & { [P in keyof T as P extends U ? never : P]-?: T[P] }
>

type SetRequired<T, U extends keyof T> = Simplify<
  { [P in U]-?: T[P] } & { [P in keyof T as P extends U ? never : P]?: T[P] }
>

type FixedArray<T, L extends number = 1, A extends T[] = []> = A['length'] extends L
  ? A
  : FixedArray<T, L, [...A, T]>
