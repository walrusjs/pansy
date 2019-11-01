# 介绍

一个令人愉快的编译器

## Features

* 🚀 快速，默认情况下零配置
* 📦 基于 rollup 进行打包
* 🚗 基于 Buble/Babel/TypeScript 自动转换 JS 文件
* 🎶 易于使用的Rollup插件
* 🎓 支持 lerna -- 待开发
* 💅 内置支持 CSS Sass Stylus Less CSS modules
* 🚨 友好的错误记录。
* 💻 支持 TypeScript

## 快速开始

Pansy 在npm上可用，如果尚未安装，请先[安装它](./installation.md)

`pansy`在项目中运行，将`src/index.js`编译为`CommonJS`格式的包：

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
