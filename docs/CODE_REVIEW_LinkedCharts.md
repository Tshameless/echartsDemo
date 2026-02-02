# LinkedCharts 组件代码评审与优化建议

## 一、整体评价

- **优点**：联动图表、图/表切换、统一 Tooltip、双 Y 轴对齐等能力完整；使用 `shallowRef`、防抖、ResizeObserver 等做了基础性能与资源管理；对 XSS 有转义意识（`escapeHtml`）。
- **待改进**：类型与命名一致性、安全与健壮性、可维护性与可测试性、部分逻辑冗余与潜在 bug。

---

## 二、问题与优化方向

### 1. 类型与命名

| 问题 | 位置 | 建议 |
|------|------|------|
| **拼写错误** | `types.ts` / `useLinkedChartOption.ts`：`legendshowValue` | 统一改为 `legendShow` 或 `legendShowValue`，并在全项目替换，避免歧义。 |
| **类型未声明** | `ChartSeriesData` 未包含 `rawData` | 在 `ChartSeriesData` 中增加 `rawData?: (number \| null)[]`，避免多处 `(s as ChartSeriesData & { rawData?: ... })` 断言。 |
| **any 过多** | `useLinkedChartOption.ts`：`customTooltipFormatter(params: any[], ...)`、`param: any` | 使用 ECharts 的 `CallbackDataParams` 或自建小接口，减少 `any`。 |
| **类型与注释不一致** | `types.ts`：`dataZoomBottom` 注释为「距离顶部」 | 改为「距离底部」或与实现一致（bottom）。 |

### 2. 安全（XSS）

| 问题 | 位置 | 建议 |
|------|------|------|
| **Tooltip 未转义** | `useLinkedChartOption.ts`：`customTooltipFormatter` 中直接拼接 `axisValue`、`param.seriesName`、`displayValue`、`color` | 若数据来自后端/用户，应统一经 `escapeHtml` 再拼入 HTML；或抽一个「安全 Tooltip 格式化」工具，与 `index.vue` 中 `buildUnifiedTooltipContent` 共用。 |
| **v-html 使用** | `index.vue`：`v-html="unifiedTooltipContent"` | 已对 `buildUnifiedTooltipContent` 做转义是好的；需确保所有写入该内容的路径都经过转义，并考虑在代码注释中注明「仅限已转义内容」。 |

### 3. 逻辑与健壮性

| 问题 | 位置 | 建议 |
|------|------|------|
| **无用分支** | `index.vue` 约 269–272 行：`if (lastRenderedChartIndex >= 0 && ... && !hasRenderedSeries)` 内无逻辑 | 删除该分支，或若原意是「不同图表间加间距」，可把后面「新的一组加间距」逻辑合并到这里并写清注释。 |
| **ref 回调副作用** | `setBoxRef(el, index)` 每次渲染都可能执行，且通过 `slice()` + 赋值更新 `boxRefs` | 易在极端情况下与 Vue 更新顺序产生竞态。可考虑：用 `(el) => setBoxRef(el, index)` 且仅在 `el` 变化时更新；或使用 `ref` 数组 + `v-for` 的 `ref` 数组用法，减少手写索引维护。 |
| **多图 timeList 假设** | `chartTableSwitchTableData` 用 `list[0]?.timeList` 作为唯一时间轴 | 注释已说明「需各图 timeList 一致」。可在开发环境对 `opts` 做一次校验（如 length 或关键点一致），不一致时 `console.warn`，避免静默错位。 |
| **convertFromPixel 兼容** | `index.vue`：`result[0]` 可能是索引或类别值，用 `timeData.indexOf(raw)` 兜底 | 若数据量大，`indexOf` 可能较慢；可对 `timeList` 建 `Map` 做 O(1) 查找，或封装成 `getDataIndexFromPoint(chart, timeList, point)` 便于单测与复用。 |

### 4. 性能

| 问题 | 位置 | 建议 |
|------|------|------|
| **watch deep: true** | `watch(() => [props.opt, props.opts], ..., { deep: true })` | 深监听在大对象上成本高。建议父组件尽量「替换引用」更新；若必须深监听，可加 `flush: 'post'` 或保持现有 debounce，并在注释中说明「依赖深监听，建议父组件换引用」。 |
| **debouncedUpdate 中 initCharts** | 当 `myCharts.value.length !== list.length` 时直接 `initCharts()` | `initCharts` 会重建实例并重新 `connect`，逻辑正确。可考虑把「仅数量变化」与「仅 option 更新」拆成两条路径，减少不必要的 `bindUnifiedTooltipEvents` 等重复调用。 |
| **buildUnifiedTooltipContent 中遍历** | 对 `sortedChartIndices` 与 `opt.series` 双重遍历，且内部有 `opt.series!.indexOf(s)` | `indexOf` 在循环里是 O(n²)。可先建 `seriesName -> index` 的 Map，再 O(1) 取颜色索引。 |

### 5. 可维护性

| 问题 | 位置 | 建议 |
|------|------|------|
| **index.vue 体积过大** | 单文件约 665 行，含模板、图表初始化、Tooltip、表格、resize、watch | 可拆分：① 统一 Tooltip 逻辑 → `useUnifiedTooltip.ts`（含 `buildUnifiedTooltipContent`、`bindUnifiedTooltipEvents`、escapeHtml）；② 图/表切换与表格列数据 → 保留或抽到 `useChartTableSwitch`；③ 图表实例生命周期 → `useLinkedChartsLifecycle.ts`（init/update/dispose/resize）。 |
| **魔法数字与样式** | 如 `TOOLTIP_OFFSET_PX = 16`、`DEBOUNCE_*`、inline style 的 `padding`/`fontSize` | 常量已抽成常量是好的；Tooltip 的样式可集中到 CSS 类或 theme 对象，便于统一换肤和修改。 |
| **重复的「单位解析」** | `index.vue` 与 `useLinkedChartOption.ts` 中都有「从 yName/tableUnit 取单位」的逻辑 | 抽成 `getSeriesDisplayUnit(series, option)` 在两边复用，减少重复与不一致。 |

### 6. 资源与生命周期

| 问题 | 位置 | 建议 |
|------|------|------|
| **ResizeObserver 清理** | `onUnmounted` 里 `disconnect` 且置空 | 正确。可再确认 `containerRef.value` 在卸载时仍可用；若框架保证卸载时 ref 仍在，当前写法无问题。 |
| **connect 的 groupId** | 使用 `props.groupId` 时由外部传入；未传时用 `eCharts.connect(validCharts)` 返回的 id | 当前清理逻辑（先 disconnect 再清空 `connectedGroupIdRef`）正确。建议在 JSDoc 或 README 中说明：同一页面多组联动时，要么都传 `groupId`，要么都不传，避免混用导致误断开。 |

### 7. 测试与可测性

| 问题 | 位置 | 建议 |
|------|------|------|
| **纯逻辑未抽离** | `getChartItemKey`、`buildUnifiedTooltipContent`、`escapeHtml` 等与组件强绑定 | 将「生成 key」「生成 Tooltip HTML」「转义」移到独立函数或工具模块，便于单测和复用。 |
| **依赖 ECharts 实例** | `isSeriesSelected`、`bindUnifiedTooltipEvents` 等直接依赖 `chart.getOption()`、`chart.getZr()` | 可为「获取图例选中状态」抽象一层接口或 stub，便于在测试里注入 mock。 |

---

## 三、建议的优化优先级

1. **高**：类型补全（`rawData`）、Tooltip 中用户数据统一转义、删除无用分支、修正 `legendshowValue` 命名。
2. **中**：抽离 `useUnifiedTooltip`、单位解析与 Tooltip 样式复用、`buildUnifiedTooltipContent` 中用 Map 替代 `indexOf`。
3. **低**：拆分为更多 composable、为 timeList 一致性加 dev 校验、单测与 mock 方案。

---

## 四、小结

- 功能完整、联动与双 Y 轴处理到位，性能上有防抖和 shallowRef 等基础优化。
- 改进重点：**类型与命名统一、Tooltip 全路径 XSS 防护、去掉死代码、适度拆分与复用**，再按优先级逐步做性能与可维护性优化。
