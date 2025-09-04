# ECharts Demo Component

一个基于Vue3和ECharts的图表组件，支持以下特性：

- 支持单/双Y轴展示
- 支持图表/表格切换显示
- 自适应容器大小
- 支持自定义样式和配置
- 支持图例交互
- 支持数据缩放

## 使用方法

```vue
<template>
  <final-version :opt="chartOptions" :height="400" />
</template>
```

## 配置项

详细配置说明请参考组件内的TypeScript接口定义。

# testEchartsComponents

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
