const path1 = require('path/posix')
// const path2 = require('path/win32')

// console.log(path1.relative('c', 'c/d'))

const a = 'asd,zxc,vbn'
const aa = a.match(/(asd)|(zxc)/g)
console.log(aa)
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
