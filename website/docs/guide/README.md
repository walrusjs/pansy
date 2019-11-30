# 介绍

A zero configuration library bundler.(一个零配置的打包工具。)

## Features

- 🚀 快速，默认情况下零配置
- 📦 基于 Rollup 进行打包
- 🚗 基于 Buble/Babel/TypeScript 自动转换 JS 文件
- 🎶 如果需要，很容易使用 Rollup 插件
- 🐚 支持别名设置，默认`@`指向项目`src`目录
- 💅 内置支持 `Css` `Sass` `Stylus` `Less` `CssModule`
- 🚨 友好的错误记录。
- 💻 使用 TypeScript 编写

## 快速开始

Pansy 在 npm 上可用，如果尚未安装，请先[安装它](./installation.md)

Pansy 在项目中运行，将`src/index.js`编译为`CommonJS`格式的包：

> 默认按照`src/index.tsx`, `src/index.ts`, `src/index.jsx`, `src/index.js`顺序查找入口文件

```bash
pansy
```

编译为其它格式

```bash
pansy --format esm
# Or multiple
pansy --format cjs --format esm
```

想要压缩的包

```bash
pansy --format esm-min --format cjs-min
```
