# 更新 package.json

在`package.json`中配置字段，以使您的包可以在各种环境（例如`npm`，`webpack`）中工作。

## 配置默认文件

* `main`：每种环境的默认文件，通常指向CommonJS文件。
* `module`：支持ES模块的工具的默认文件。您应该尽可能使用`Pansy`生成的ESM文件。
* `unpkg`：`unpkg.com`的默认文件，main的后备文件。您应该将其指向`umd`或`iife`捆绑包。

## 指定包含的文件

您应该指定应在npm上发布哪些文件，而不是发布所有文件，因为pansy会在此处将所有文件输出到`dist`目录，如下所示：

```json
{
  "files": ["dist"]
}
```
