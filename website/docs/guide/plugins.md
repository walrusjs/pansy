# 插件

Pansy 允许您添加其他汇总插件，如下所示：

```javascript
module.exports = {
  plugins: {
    name: true | false | object
  }
};
```

`name`应为插件包的名称，不带 rollup-plugin-前缀。

**注意：**

- 插件默认会按照 `@rollup/plugin-*`、`rollup-plugin-*`顺序加载插件
- 如果是组织下的 Rollup 插件请使用全名，例如`@svgr/rollup`

该值将用作其选项，传递`true`等效于一个空对象，`false`用于禁用内置插件。

要通过 CLI 标志添加插件，您可以执行以下操作：

```bash
pansy --plugin.foo --plugin.bar.option value
```

要禁用内置的 Babel 插件：

```bash
pansy --no-plugin.babel
```
