# 常见问题

# `cjs`与`commonjs`的区别

`cjs`是`commonjs`的简写，无需重复设置，推荐使用`cjs`

# `es`与`esm`的区别

`es`是`esm`的简写，无需重复设置，推荐使用`es`

# typescript 是否必须设置 tsconfig.json

`@walrus/pansy`有默认`tsconfig.json`，当在编辑的项目查找不到`tsconfig.json`就会使用默认的。

# 入口文件是否必须设置

入口文件`['src/index.tsx', 'src/index.ts', 'src/index.jsx', 'src/index.js']`会按照这个顺序查找，如果是此入口文件。则无须设置。
