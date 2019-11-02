# CSS

Pansy 在默认情况下使用[rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss)支持 CSS：

默认情况下，CSS 文件将被生成到和 JS 的相同位置。

您可以使用 CLI 选项：`--no-extract-css`或配置文件来将 CSS 内嵌到编译后的文件中：

```javascript
module.exports = {
  output: {
    extractCSS: false
  }
};
```

## PostCSS 配置

您可以通过写`postcss.config.js`以使用自定义 PostCSS 插件。

## Css 预处理器

**注意:** 内置支持less，可直接使用

`rollup-plugin-postcss` 还支持常见的 CSS 预处理器，例如 Sass：

```bash
yarn add node-sass --dev
```

然后，您可以导入`.scss`或`.sass`文件。

对于`Stylus`，您还需要在项目中安装`stylus`。

```bash
yarn add stylus --dev
```
