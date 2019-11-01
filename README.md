<h1 align="center">pansy</h1>

<div align="center">
A zero configuration library bundler.
</div>

[![Alita](https://img.shields.io/badge/alitajs-walrus-blue.svg)](https://github.com/walrus-plus/walrus)
[![NPM version](https://img.shields.io/npm/v/@pansy/cli.svg?style=flat)](https://npmjs.org/package/@pansy/cli)

> 本项目主要参考[bili](https://github.com/egoist/bili)，做些定制化功能。

## ✨ 特性

- 🚀 快速，默认情况下零配置
- 📦 基于 rollup 进行打包
- 🚗 基于 Buble/Babel/TypeScript 自动转换 JS 文件
- 🎶 易于使用的`Rollup`插件
- 🎓 支持 `lerna` -- 待开发
- 💅 内置支持 `CSS` `Sass` `Stylus` `Less` `CSS modules`
- 🚨 友好的错误记录。
- 💻 支持 TypeScript

## 📦 安装

* npm安装

```bash
npm install @pansy/cli --dev --save
```

* yarn安装

```bash
yarn add @pansy/cli --dev
```

## 🔨 使用

* 创建入口文件

```
// src/index.js
const test = 'Hello World';

export function main() {
  console.log(test);
}
```

* 执行编译

```bash
cd /my-project
pansy
```

## 📝 文档

https://pansy.now.sh
