# CSS

Pansy在默认情况下使用[rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss)支持CSS：

默认情况下，CSS文件将被生成到和JS的相同位置。

您可以使用CLI选项：`--no-extract-css`或配置文件来将CSS内嵌到编译后的文件中：

```javascript
module.exports = {
  output: {
    extractCSS: false
  }
}
```

## PostCSS 配置

您可以通过写`postcss.config.js`以使用自定义PostCSS插件。

## Css预处理器

`rollup-plugin-postcss` 还支持常见的CSS预处理器，例如Sass：

```bash
yarn add node-sass --dev
```

然后，您可以导入`.scss`或`.sass`文件。

对于`Stylus`和`Less`，您还需要在项目中安装`stylus`和`less`。

```bash
// 使用stylus
yarn add stylus --dev

// 使用less
yarn add less --dev
```
