export class Hook<T extends unknown[]> {
  private context: unknown

  private hooks: ((...args: T) => unknown)[] = []

  constructor(context?: unknown) {
    this.context = context || this
  }

  register(hook: (...args: T) => unknown) {
    this.hooks.push(hook)
  }

  deregister(hook: (...args: T) => unknown) {
    for (let i = 0; i < this.hooks.length; i++) {
      if (hook === this.hooks[i]) {
        this.hooks.splice(i, 1)
        break
      }
    }
  }

  trigger(...args: T) {
    const promises: unknown[] = []

    for (const hook of this.hooks) {
      promises.push(hook.apply(this.context, args))
    }

    return Promise.all(promises)
  }
}
