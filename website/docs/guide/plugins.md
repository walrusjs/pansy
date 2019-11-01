# 插件

Pansy允许您添加其他汇总插件，如下所示：

```javascript
module.exports = {
  plugins: {
    name: true | false | object
  }
}
```

`name`应为插件包的名称，不带rollup-plugin-前缀。

该值将用作其选项，传递`true`等效于一个空对象，`false`用于禁用内置插件。

要通过CLI标志添加插件，您可以执行以下操作：

```bash
pansy --plugin.foo --plugin.bar.option value
```

要禁用内置的Babel插件：

```bash
pansy --no-plugin.babel
```
