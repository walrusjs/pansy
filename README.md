<h1 align="center">@walrus/pansy</h1>

<h2 align="center">
A zero configuration library bundler.
</h2>

[![Alita](https://img.shields.io/badge/alitajs-pansy-blue.svg)](https://github.com/walrusjs/pansy)
[![NPM version](https://img.shields.io/npm/v/@walrus/pansy.svg?style=flat)](https://npmjs.org/package/@walrus/pansy.svg)
[![NPM downloads](https://img.shields.io/npm/dm/@walrus/pansy.svg?style=flat)](https://npmjs.org/package/@walrus/pansy.svg)

> 本项目主要参考[bili](https://github.com/egoist/bili)，做些定制化功能。

## ✨ 特性

- 🚀 快速，默认情况下零配置
- 📦 基于 rollup 进行打包
- 🚗 基于 Buble/Babel/TypeScript 自动转换 JS 文件
- 🎶 如果需要，很容易使用 Rollup 插件
- 🐚 支持别名设置，默认`@`指向项目`src`目录
- 💅 内置支持 `CSS` `Sass` `Stylus` `Less` `CSS modules`
- 🚨 友好的错误记录。
- 💻 使用 TypeScript 编写

## 📝 文档

https://pansy.now.sh

## 📦 安装

- npm 安装

```bash
npm install @walrus/pansy --dev --save
```

- yarn 安装

```bash
yarn add @walrus/pansy --dev
```

## 🔨 使用

- 创建入口文件

```
// src/index.js
const test = 'Hello World';

export function main() {
  console.log(test);
}
```

- 执行编译

```bash
cd /my-project
pansy
```

**注意:** pansy 会自动依次尝试读取`src/index.tsx`、`src/index.ts`、`src/index.jsx`、`sec/index.js`，如入口文件是上面四个文件，则无须设置。

## ⌨️ 本地开发

```
# 克隆项目
$ git clone git@github.com:walrus-plus/pansy.git

# 切换到项目目录
$ cd pansy

# 安装依赖
$ yarn bootstrap

# 编译项目
$ yarn types && yarn build
```

## 🌟 社区互助

| Github Issue                                       | 钉钉群                                                                                     | 微信群                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| [issues](https://github.com/walrusjs/pansy/issues) | <img src="https://github.com/alitajs/alita/blob/master/public/dingding.png" width="100" /> | <img src="https://github.com/alitajs/alita/blob/master/public/wechat.png" width="100" /> |
