/* eslint-disable @typescript-eslint/no-explicit-any */
export class Hook<T extends (...args: any) => any> {
  private context: any

  private hooks: T[] = []

  constructor(context?: any) {
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
    return new Promise<any[]>(resolve => {
      const result: any[] = []
      for (let i = 0; i < this.hooks.length; i++) {
        const hook = this.hooks[i]
        try {
          result[i] = hook.apply(this.context, args)
        } catch (error) {
          result[i] = error
        }
      }

      let n = result.length
      for (let i = 0; i < result.length; i++) {
        const item = result[i]
        if (item instanceof Promise) {
          item
            .then(value => (result[i] = value))
            .catch(error => (result[i] = error))
            .finally(() => (n -= 1) === 0 && resolve(result))
        } else {
          n -= 1
        }
      }

      if (n === 0) {
        resolve(result)
      }
    })
  }
}
