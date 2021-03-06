# js 中浅拷贝有哪些

重点：什么是拷贝？

```js
let arr = [1, 2, 3];
let newArr = arr;
newArr[0] = 100;

console.log(newArr); //[100, 2, 3]
console.log(arr); //[100, 2, 3]
```

这是直接赋值的情况，不涉及任何拷贝。当改变 newArr 的时候，由于是同一个引用，arr 指向的值也跟着改变

现在进行浅拷贝:

```js
let arr = [1, 2, 3];
let newArr = arr.slice();
newArr[0] = 100;

console.log(newArr); //[ 100, 2, 3 ]

console.log(arr); //[1, 2, 3]
```

当修改 newArr 的时候，arr 的值并不改变。什么原因?因为这里 newArr 是 arr 浅拷贝后的结果，newArr 和 arr 现在引用的已经不是同一块空间啦！

这就是浅拷贝！

但是这又会带来一个潜在的问题:

```js
let arr = [1, 2, { val: 4 }];
let newArr = arr.slice();
newArr[2].val = 1000;

console.log(arr); //[ 1, 2, { val: 1000 } ]
```

咦!不是已经不是同一块空间的引用了吗？为什么改变了 newArr 改变了第二个元素的 val 值，arr 也跟着变了。

这就是浅拷贝的限制所在了。它只能拷贝一层对象。如果有对象的嵌套，那么浅拷贝将无能为力。但幸运的是，深拷贝就是为了解决这个问题而生的，它能 解决无限极的对象嵌套问题，实现彻底的拷贝。

接下来，我们来研究一下 JS 中实现浅拷贝到底有多少种方式？

## 1.手动实现

```js
const shallowClone = (target) => {
  if (typeof target === "object" && target !== null) {
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = target[prop];
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
};
```

## 2. Object.assign

但是需要注意的是，Object.assgin() 拷贝的是对象的属性的引用，而不是对象本身

```js
let obj = { name: "sy", age: 18 };
const obj2 = Object.assign({}, obj, { name: "sss" });
console.log(obj2); //{ name: 'sss', age: 18 }
```

## 3. concat 浅拷贝数组

```js
let arr = [1, 2, 3];
let newArr = arr.concat();
newArr[1] = 100;
console.log(arr); //[ 1, 2, 3 ]
```

## 4. slice 浅拷贝

开头的例子不就说的这个嘛！

## 5. ...展开运算符

```js
let arr = [1, 2, 3];
let newArr = [...arr]; //跟arr.slice()是一样的效果
```
