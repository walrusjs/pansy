# 环境变量

您可以将代码中的`process.env.{VAR}`替换为特定值。 例如，我们的代码如下：

```javascript
export const version = process.env.VERSION;
```

然后，您可以使用 CLI 标志`--env.VERSION 0.0.0`运行 Pansy，以将相应的变量替换为：

```javascript
export const version = '0.0.0';
```

您还可以在 pansy 配置文件中指定`env`：

```javascript
// bili.config.js
module.exports = {
  env: {
    VERSION: '0.0.0'
  }
};
```
