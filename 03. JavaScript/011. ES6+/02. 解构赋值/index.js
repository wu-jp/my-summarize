// let [a, b, c] = [1, 2, 3]
// console.log(a, b, c)

let [foo, [[bar], baz]] = [1, [[2], 3]]
console.log(foo, bar, baz)

let [, , third] = [1, 2, 3]
console.log(third)

let [head, ...tail] = [1, 2, 3, 4]
console.log(head, tail)

let [x, y, ...z] = ['a']
console.log(x, y, z)
