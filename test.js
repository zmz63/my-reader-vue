// const path1 = require('path/posix')
// const path2 = require('path/win32')

// console.log(path1.relative('c', 'c/d'))

// const a = 'asd,zxc,vbn'
// const aa = a.match(/(asd)|(zxc)/g)
// console.log(aa)
// console.log(path1.dirname('/a/zxc.aaa'))
// console.log(path1.join('/', 'a'))
// console.log(path2.dirname('/a/zxc.aaa'))

// const a = Promise.resolve()

// a.then(() => {
//   console.log(1)
// })

// setTimeout(() => {
//   a.then(() => {
//     console.log(2)
//   })
// }, 1000)

const a1 = { a: 1, b: 1, c: 1, d: 1, e: 1 }
const a2 = { a: undefined, b: null, c: '', d: 0, e: false }

console.log({ ...a1, ...a2 })
console.log(Object.assign(a1, a2))
