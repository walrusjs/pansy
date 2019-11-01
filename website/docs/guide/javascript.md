# JavaScript

## Babel

我们为`Babel`使用了合理的默认预设，如下：

- 使用`babel-preset-env`。
- 通过`babel-preset-typescript`编译 TypeScript。
- 编译`object-rest-spread`为`Object.assign`。
- 使用[babel-plugin-transform-async-to-promises](https://github.com/rpetrich/babel-plugin-transform-async-to-promises)编译`async/await`
- 编译 JSX

可以在项目中添加`.babelrc`文件以使用自定义配置。如果在项目中禁用`.babelrc`，请通过`--no-babelrc`标志。

还可以在`Babel`配置文件中使用我们的默认预设：

```javascript
// pansy.config.js
module.exports = {
  presets: ['pansy/babel'],
  plugins: [
    // Add your babel plugins...
  ]
};
```

## Browserslist

默认情况下，Babel 将代码转换为 ES5，但是您可以使用`Browserslist` 来指定目标环境，例如，如果您只想支持`Node.js 10`，可以在`package.json`中添加以下配置：

```json
{
  "browserslist": ["node 10"]
}
```

## 最小模式

`babel-preset-env`如果以 ES5 为目标，则会生成很多代码，因此我们提供了一个选项`babel.minimal`，用[Buble](https://buble.surge.sh/guide/)代替此预设。也可以使用 CLI 标志`--minimal`。

**注意：**

- `Buble`不严格遵循规范，请谨慎使用
- `Browserslist`将不再起作用，因为它是`babel-preset-env`中的功能。但是您可以使用`buble`中的[target](https://buble.surge.sh/guide/#options)进行配置。

## TypeScript

当入口文件以`.ts`扩展名结尾时，我们会自动使用`rollup-plugin-typescript2`, 但是必须安装`typescript`才能使其正常工作。

```bash
yarn add typescript --dev
```

## 将 Babel 与 TypeScript 一起使用

默认情况下，Babel 也用于`.ts`文件，它将在 TypeScript 之后处理文件。建议将`tsconfig.json`设置`compilerOptions.target`为`es2017`或更高，然后让`Babel`将代码转换为`ES5`。如果要禁用 Babel，请在`Pansy`配置文件中设置`plugins: { babel: false }`。
