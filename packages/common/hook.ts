/* eslint-disable @typescript-eslint/no-explicit-any */
export class Hook<T extends (...args: any) => any> {
  private context: unknown

  private hooks: T[] = []

  constructor(context?: unknown) {
    this.context = context || this
  }

  register(hook: T) {
    this.hooks.push(hook)
  }

  deregister(hook: T) {
    for (let i = 0; i < this.hooks.length; i++) {
      if (hook === this.hooks[i]) {
        this.hooks.splice(i, 1)
        break
      }
    }
  }

  trigger(...args: Parameters<T>) {
    const promises: ReturnType<T>[] = []

    for (const hook of this.hooks) {
      promises.push(hook.apply(this.context, args))
    }

    return Promise.all(promises)
  }
}
