---
home: true
actionText: 快速上手
actionLink: /guide/
footer: MIT Licensed | Copyright © 2019 Walrus
---

<div class="features">
  <div class="feature">
    <h2>零配置</h2>
    <p>默认情况下，你无需任何配置，即可打包你的项目。</p>
  </div>
  <div class="feature">
    <h2>基于Rollup</h2>
    <p>基于Rollup的生态封装，支持无缝使用Rollup插件。</p>
  </div>
  <div class="feature">
    <h2>功能强大</h2>
    <p>内置支持 CSS、Sass、Stylus、Less、CssModule、Typescript、React、Vue。</p>
  </div>
</div>

```bash
# 切换到项目目录
cd ./my-project

# 安装
yarn add --dev @walrus/pansy

# 创建编译文件
mkdir src && cd ./src
echo 'const test = "Hello World";' > index.js

# 执行编译
pansy
```
