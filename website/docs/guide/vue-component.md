# Vue 组件

如果您的输入文件之一以`.vue`结尾，Pansy 将自动使用[rollup-plugin-vue](https://rollup-plugin-vue.vuejs.org) 。

否则，您需要使用 CLI 标志`--plugin.vue`或配置文件手动添加`rollup-plugin-vue`：

```javascript
// pansy.config.js
module.exports = {
  plugins: {
    vue: true
    // or with custom options
    // vue: {}
  }
};
```
