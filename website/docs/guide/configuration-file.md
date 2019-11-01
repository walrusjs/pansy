# 配置文件

在大多数情况下，CLI选项可以正常工作，但是也可以使用以下配置文件：

* `pansy.config.js`
* `pansy.config.ts`
* `.pansyrc.js`
* `.pansyrc.ts`

请参阅[配置](../config/README.md)

## 语法

这两个`.js`和`.ts`配置文件由`Babel`使用 [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env)和[babel-preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)进行转换，所以随意使用现代的JavaScript功能。

## TypeScript

Pansy公开了`Config`可用于配置的类型检查：

```typescript
// pansy.config.ts
import { Config } from '@pansy/cli';

const config: Config = {
  input: 'src/index.js'
}

export default config
```
