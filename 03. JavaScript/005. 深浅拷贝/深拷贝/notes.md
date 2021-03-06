# 如何实现一个深拷贝

## 1. 简易版及问题

```js
JSON.parse(JSON.stringify());
```

估计这个 api 能覆盖大多数的应用场景，没错，谈到深拷贝，我第一个想到的也是它。但是实际上，对于某些严格的场景来说，这个方法是有巨大的坑的。问题如下：

> 1.无法解决循环引用的问题
>
> ```js
> const a = { val: 2 };
> a.target = a;
> ```
>
> 拷贝 a 会出现系统栈溢出，因为出现了无限递归的情况。

> 2.无法拷贝一写特殊的对象，诸如 `RegExp, Date, Set, Map` 等。

> 3.无法拷贝函数(划重点)。

因此这个 api 先 pass 掉，我们重新写一个深拷贝，简易版如下:

```js
const deepClone = (target) => {
  if (typeof target === "object" && target !== null) {
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop]);
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
};
```

现在，我们以刚刚发现的三个问题为导向，一步步来完善、优化我们的深拷贝代码

## 2. 解决循环引用

现在问题如下:

```js
let obj = { val: 100 };
obj.target = obj;

deepClone(obj); //报错: RangeError: Maximum call stack size exceeded
```

这就是循环引用。我们怎么来解决这个问题呢？

创建一个 Map。记录下已经拷贝过的对象，如果说已经拷贝过，那直接返回它行了。

```js
const isObject = (target) =>
  (typeof target === "object" || typeof target === "function") &&
  target !== null;

const deepClone = (target, map = new Map()) => {
  if (map.get(target)) return target;

  if (isObject(target)) {
    map.put(target, true);
    const cloneTarget = Array.isArray(target) ? [] : {};
    for (let prop in target) {
      if (target.hasOwnProperty(prop)) {
        cloneTarget[prop] = deepClone(target[prop]);
      }
    }
    return cloneTarget;
  } else {
    return target;
  }
};
```

现在来试一试：

```js
const a = { val: 2 };
a.target = a;
let newA = deepClone(a);
console.log(newA); //{ val: 2, target: { val: 2, target: [Circular] } }
```

好像是没有问题了, 拷贝也完成了。但还是有一个潜在的坑, 就是 map 上的 key 和 map 构成了强引用关系，这是相当危险的。给你解释一下与之相对的弱引用的概念你就明白了：

> 在计算机程序设计中，弱引用与强引用相对， 是指不能确保其引用的对象不会被垃圾回收器回收的引用。 一个对象若只被弱引用所引用，则被认为是不可访问（或弱可访问）的，并因此可能在任何时刻被回收。 --百度百科

说的有一点绕，我用大白话解释一下，被弱引用的对象可以在任何时候被回收，而对于强引用来说，只要这个强引用还在，那么对象无法被回收。拿上面的例子说，map 和 a 一直是强引用的关系， 在程序结束之前，a 所占的内存空间一直不会被释放。

怎么解决这个问题？

很简单，让 map 的 key 和 map 构成弱引用即可。ES6 给我们提供了这样的数据结构，它的名字叫 WeakMap，它是一种特殊的 Map, 其中的键是弱引用的。其键必须是对象，而值可以是任意的。

稍微改造一下即可:

```js
const deepClone = (target, map = new Map()) => {
  //...
};
```

## 3. 拷贝特殊对象

### 可继续遍历

对于特殊的对象，我们使用以下方式来鉴别:

```js
Object.prototype.toString.call(obj);
```

梳理一下对于可遍历对象会有什么结果：

```js
["object Map"]["object Set"]["object Array"]["object Object"][
  "object Arguments"
];
```

好，以这些不同的字符串为依据，我们就可以成功地鉴别这些对象。

```js
const getType = Object.prototype.toString.call(obj);

const canTraverse = {
  "[object Map]": true,
  "[object Set]": true,
  "[object Array]": true,
  "[object Object]": true,
  "[object Arguments]": true,
};

const deepClone = (target, map = new Map()) => {
  if (!isObject(target)) return target;
  let type = getType(target);
  let cloneTarget;
  if (!canTraverse[type]) {
    // 处理不能遍历的对象
    return;
  } else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.prototype;
    cloneTarget = new ctor();
  }

  if (map.get(target)) return target;
  map.put(target, true);

  if (type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key), deepClone(item));
    });
  }

  if (type === setTag) {
    //处理Set
    target.forEach((item) => {
      target.add(deepClone(item));
    });
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
      cloneTarget[prop] = deepClone(target[prop]);
    }
  }
  return cloneTarget;
};
```

### 不可遍历的对象

```js
const boolTag = "[object Boolean]";
const numberTag = "[object Number]";
const stringTag = "[object String]";
const dateTag = "[object Date]";
const errorTag = "[object Error]";
const regexpTag = "[object RegExp]";
const funcTag = "[object Function]";
```

对于不可遍历的对象，不同的对象有不同的处理。

```js
const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
};

const handleFunc = (target) => {
  // 待会的重点部分
};

const handleNotTraverse = (target, tag) => {
  const Ctor = targe.constructor;
  switch (tag) {
    case boolTag:
    case numberTag:
    case stringTag:
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
};
```

## 4. 拷贝函数

虽然函数也是对象，但是它过于特殊，我们单独把它拿出来拆解。

提到函数，在 JS 种有两种函数，一种是普通函数，另一种是箭头函数。每个普通函数都是 Function 的实例，而箭头函数不是任何类的实例，每次调用都是不一样的引用。那我们只需要 处理普通函数的情况，箭头函数直接返回它本身就好了。

那么如何来区分两者呢？

答案是: 利用原型。箭头函数是不存在原型的。

代码如下:

```js
const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if (!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if (!body) return null;
  if (param) {
    const paramArr = param[0].split(",");
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
};
```

到现在，我们的深拷贝就实现地比较完善了。不过在测试的过程中，我也发现了一个小小的 bug。

## 5. 小小的 bug

```js
const target = new Boolean(false);
const Ctor = target.constructor;
new Ctor(target); // 结果为 Boolean {true} 而不是 false。
```

对于这样一个 bug，我们可以对 Boolean 拷贝做最简单的修改， 调用 `valueOf: new target.constructor(target.valueOf())`。

但实际上，这种写法是不推荐的。因为在 ES6 后不推荐使用【new 基本类型()】这 样的语法，所以 es6 中的新类型 Symbol 是不能直接 new 的，只能通过 `new Object(SymbelType)`。

因此我们接下来统一一下:

```js
const handleNotTraverse = (target, tag) => {
  const Ctor = targe.constructor;
  switch (tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
};
```

OK!是时候给大家放出完整版的深拷贝啦:

```js
const getType = (obj) => Object.prototype.toString.call(obj);

const isObject = (target) =>
  (typeof target === "object" || typeof target === "function") &&
  target !== null;

const canTraverse = {
  "[object Map]": true,
  "[object Set]": true,
  "[object Array]": true,
  "[object Object]": true,
  "[object Arguments]": true,
};
const mapTag = "[object Map]";
const setTag = "[object Set]";
const boolTag = "[object Boolean]";
const numberTag = "[object Number]";
const stringTag = "[object String]";
const symbolTag = "[object Symbol]";
const dateTag = "[object Date]";
const errorTag = "[object Error]";
const regexpTag = "[object RegExp]";
const funcTag = "[object Function]";

const handleRegExp = (target) => {
  const { source, flags } = target;
  return new target.constructor(source, flags);
};

const handleFunc = (func) => {
  // 箭头函数直接返回自身
  if (!func.prototype) return func;
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  // 分别匹配 函数参数 和 函数体
  const param = paramReg.exec(funcString);
  const body = bodyReg.exec(funcString);
  if (!body) return null;
  if (param) {
    const paramArr = param[0].split(",");
    return new Function(...paramArr, body[0]);
  } else {
    return new Function(body[0]);
  }
};

const handleNotTraverse = (target, tag) => {
  const Ctor = target.constructor;
  switch (tag) {
    case boolTag:
      return new Object(Boolean.prototype.valueOf.call(target));
    case numberTag:
      return new Object(Number.prototype.valueOf.call(target));
    case stringTag:
      return new Object(String.prototype.valueOf.call(target));
    case symbolTag:
      return new Object(Symbol.prototype.valueOf.call(target));
    case errorTag:
    case dateTag:
      return new Ctor(target);
    case regexpTag:
      return handleRegExp(target);
    case funcTag:
      return handleFunc(target);
    default:
      return new Ctor(target);
  }
};

const deepClone = (target, map = new Map()) => {
  if (!isObject(target)) return target;
  let type = getType(target);
  let cloneTarget;
  if (!canTraverse[type]) {
    // 处理不能遍历的对象
    return handleNotTraverse(target, type);
  } else {
    // 这波操作相当关键，可以保证对象的原型不丢失！
    let ctor = target.constructor;
    cloneTarget = new ctor();
  }

  if (map.get(target)) return target;
  map.set(target, true);

  if (type === mapTag) {
    //处理Map
    target.forEach((item, key) => {
      cloneTarget.set(deepClone(key, map), deepClone(item, map));
    });
  }

  if (type === setTag) {
    //处理Set
    target.forEach((item) => {
      cloneTarget.add(deepClone(item, map));
    });
  }

  // 处理数组和对象
  for (let prop in target) {
    if (target.hasOwnProperty(prop)) {
      cloneTarget[prop] = deepClone(target[prop], map);
    }
  }
  return cloneTarget;
};
```
