## 2.2 浮动布局的优点? 有什么缺点? 清除浮动有哪些方法?

> 浮动布局简介:当元素浮动以后可以向左或向右移动，直到它的外边缘碰到包含它的框或者另外一个浮动元素的边框为止。元素浮动以后会脱离正常的文档流，所以文档的普通流中的框就变现的好像浮动元素不存在一样。

## 优点

这样做的优点就是在图文混排的时候可以很好的使文字环绕在图片周围。另外当元素浮动了起来之后，它有着块级元素的一些性质例如可以设置宽高等，但它与 inline-block 还是有一些区别的，第一个就是关于横向排序的时候，float 可以设置方向而 inline-block 方向是固定的；还有一个就是 inline-block 在使用时有时会有空白间隙的问题

## 缺点

最明显的缺点就是浮动元素一旦脱离了文档流，就无法撑起父元素，会造成父级元素的高度塌陷。

## 清除浮动的方法

1. 添加额外的标签

   ```html
   <div class="parent">
     <!-- 添加额外标签并且添加clear属性 -->
     <div style="clear:both"></div>
     <!-- 也可以加一个br标签 -->
   </div>
   ```

2. 父级添加 overflow 属性，或者设置高度

   ```html
   <div class="parent" style="overflow:hidden">
     <!-- auto 也可以 将父元素的overflow设置为hidden -->
     <div class="f"></div>
   </div>
   ```

3. 建立伪类选择器清除浮动（推荐）

   ```css
   .parent:after {
     /* 设置添加子元素的内容是空 */
     content: "";
     /* 设置添加子元素为块级元素 */
     display: block;
     /* 设置添加的子元素的高度0 */
     height: 0;
     /* 设置添加子元素看不见 */
     visibility: hidden;
     /* 设置clear：both */
     clear: both;
   }
   ```

   ```html
   <div class="parent">
     <div class="f"></div>
   </div>
   ```
