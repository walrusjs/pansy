---
sidebarDepth: 4
sidebar: auto
---

# 配置项

## babel

- 类型:

```
{
  asyncToPromises?: boolean;
  babelrc?: boolean;
  configFile?: boolean;
  jsx?: string;
  minimal?: boolean;
  objectAssign?: string
}

```

- 默认值:

```
{
  asyncToPromises: true
}
```

配置默认 Babel 预设

### babel.asyncToPromises

是否转换`async/await`为`Promise`，默认开启

### babel.babelrc

禁用.babelrc，默认情况下 Pansy 会读取它

### babel.configFile

禁用`babel.config.js`

### babel.jsx

自定义 JSX 编译。 如果要使用`Preact`，请将其设置为`h`。

### babel.minimal

禁用`babel-preset-env`，但仍可以使用其他 babel 插件。另外，我们在`rollup-plugin-babel`之后使用`rollup-plugin-buble`

### babel.objectAssign

用自己的方法替换`Object.assign`

## banner

- 类型:

```
string | { author: any; license: string: name: string; version: string } | boolean

```

在输出包的顶部插入版权消息。

**注意：** 设置为`ture`，pansy 会自动读取`package.json`中的数据

## bundleNodeModules

- 类型: `boolean | string[]`

```
string | { author: any; license: string: name: string; version: string } | boolean

```

- cli `--bundle-node-modules`

在打包文件中包含 node module。请注意，对于 UMD 格式包始终有效。

## env

- 类型:

```
{
  [k: string]: string | number | boolean
}

```

- cli `--env.<name> value`

定义仅在您的库代码中可用的`env`变量，如果您的库中有类似这样的代码。

```
if (process.env.NODE_ENV === 'development') {
  console.log('debug')
}
```

您可以运行以下命令来替换`env`变量：

```bash
pansy --env.NODE_ENV production
```

默认情况下，我们不添加任何环境变量。

## extendConfig

- 类型:

```
(config: NormalizedConfig, namedParameters: object): NormalizedConfig;
```

关于[NormalizedConfig](https://github.com/walrusjs/pansy/blob/master/src/types.ts)

### 参数

- config

- namedParameters: object

```
format: Format
input: string[] | object
```

扩展 Pansy 配置

## extendRollupConfig

- 类型: `function`

```
(config: RollupConfig) => RollupConfig
```

扩展生成的 rollup 配置

## externals

- 类型:

```
(string | RegExp | function)[]
```

引入`node modules`模块时，可用来指定排除特定模块

## globals

- 类型: `undefined | object`

- cli: `--global.<moduleId> <variableName`

指定`umd`/`iife`捆绑包中的外部导入所需的`moduleId: variableName`对。 例如：

```javascript
import $ from 'jquery';
```

您可以将 jquery 模块 ID`$`映射到全局变量：

```javascript
// pansy.config.js
export default {
  globals: {
    jquery: '$'
  }
};
```

## input

- 类型

```
interface ConfigEntryObject {
  [entryName: string]: string
}

string | ConfigEntryObject | Array<ConfigEntryObject | string>
```

- 默认 `src/index.js`

- cli `pansy [...input]`

## output

- 类型

```
{
  format?: Format | Format[];
  dir?: string;
  fileName?: string | GetFileName;
  moduleName?: string;
  minify?: boolean;
  extractCSS?: boolean;
  sourceMap?: boolean;
  sourceMapExcludeSources?: boolean;
  target?: OutputTarget;
}
```

配置输出

### output.dir

- 类型 `string`
- 默认 `dist`
- cli `-d, --out-dir <dir>`

设置输出目录

### output.extractCSS

- 类型 `boolean`
- 默认 `true`

### output.fileName

- 类型

```
string | GetFileName
```

- 默认

* `cjs` 和 `esm` 格式化为 `[name][min][ext]`
* 其他包格式化为`[name][min].[format].js`

占位符：

[name]：输入文件的基本名称
[format]：输出格式
[min]：当格式以-min 结尾时，它将替换为.min，否则为空字符串。

- cli `--file-name <fileName>`

输出文件的名称

### output.format

- 类型

```
type Format =
  | 'amd'
  | 'cjs'
  | 'commonjs'
  | 'es'
  | 'esm'
  | 'iife'
  | 'module'
  | 'system'
  | 'umd';
  | 'cjs-min'
  | 'es-min'
  | 'esm-min'
  | 'umd-min'
  | 'iife-min'
  | 'amd-min'
  | 'system-min';

Format | Format[]
```

- 默认 `cjs`
- cli `--format <format>`

输出格式。 您可以将 min 附加到格式中以生成缩小的包。

### output.minify

- 类型 `boolean`

是否缩小输出文件而不考虑格式，使用此选项不会在输出文件名后添加.min 后缀。

### output.moduleName

- 类型 `string`

`umd`的模块名称

### output.sourceMap

- 类型 `boolean`

是否生成 source maps

### output.sourceMapExcludeSources

- 类型 `boolean`

在 source maps 中排除源代码

### output.target

- 类型 `"node" | "browser"`
- 默认 `node`
- cli `--target <target>`

输出目标

## plugins

- 类型 `object`
- cli `--plugin.<name> [option]`

使用`Rollup`插件

## resolvePlugins

- 类型 `object`
- cli `--plugin.<name> [option]`

通过名称解析插件。这将覆盖插件默认行为，例如

```
{
  resolvePlugins: {
    replace: require('./my-fork-of-rollup-plugin-replace')
  }
}
```
