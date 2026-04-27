<template>
    <div class="chart-container">
        <!-- 切换开关 -->
        <n-switch v-model:value="showValue" :round="false" v-if="showTable" class="chart-switch">
            <template #checked>图形</template>
            <template #unchecked>图表</template>
        </n-switch>

        <div class="clearfix">
            <!-- 图形渲染器 -->
            <ChartRenderer 
                v-show="showValue"
                ref="rendererRef"
                :option="finalOption" 
                :height="height" 
                @legend-select-changed="handleLegendChange"
            />

            <!-- 表格渲染器 -->
            <DataTableRenderer 
                v-show="!showValue"
                :columns="tableHeader"
                :data="tableData"
                :height="height"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRefs, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import type { ChartOptions } from './types'

// 导入重构后的组件和 Hooks
import ChartRenderer from './components/ChartRenderer.vue'
import DataTableRenderer from './components/DataTableRenderer.vue'
import { useProcessedData } from './useProcessedData'
import { useChartOption } from './useChartOption'
import { useChartTable } from './useChartTable'

// 定义 Props
interface LineChartProps {
    opt: ChartOptions
    height?: number | string
}

const props = withDefaults(defineProps<LineChartProps>(), {
    height: 400
})

const { opt } = toRefs(props)
const rendererRef = ref<InstanceType<typeof ChartRenderer>>()

// 1. 逻辑抽离：补点逻辑处理
const { processedOpt } = useProcessedData(opt)

// 2. 逻辑抽离：ECharts Option 生成逻辑
const { getFinalOption } = useChartOption()
const finalOption = ref({})

// 3. 逻辑抽离：表格数据处理
const { showTable, tableData, tableHeader, showValue, calculateTableData } = useChartTable()

/** 响应图例切换，保持 Y 轴对齐 */
const handleLegendChange = (params: any) => {
    const selected = params.selected
    const currentOpt = processedOpt.value
    
    // 过滤出当前选中的系列
    const filteredSeries = currentOpt.series?.filter(s => selected[s.name])
    
    // 重新生成配置（主要是更新 Y 轴范围）
    finalOption.value = getFinalOption(currentOpt, filteredSeries)
}

// 防抖处理配置变化
const debouncedUpdate = debounce((newVal: ChartOptions) => {
    if (newVal && Object.keys(newVal).length > 0) {
        updateAll(newVal)
    }
}, 50)

// 暴露 API
defineExpose({
    resize: () => rendererRef.value?.resize()
})

// 核心更新函数
const updateAll = (config: ChartOptions, isDataChange = true) => {
    finalOption.value = getFinalOption(config)
    
    // 只要数据变化，就通知表格 Hook（Hook 内部会处理懒加载逻辑）
    if (isDataChange) {
        calculateTableData(config)
    }
}

// 1. 监听数据核心属性变化（触发全量更新）
watch(
    () => [processedOpt.value.series, processedOpt.value.timeList],
    () => {
        debouncedUpdate(processedOpt.value)
    },
    { deep: true }
)

// 2. 监听样式类属性变化（仅更新图表配置，不触发表格）
watch(
    () => {
        const { series, timeList, ...rest } = processedOpt.value
        return rest
    },
    () => {
        finalOption.value = getFinalOption(processedOpt.value)
    },
    { deep: true }
)

// 初始加载
onMounted(() => {
    if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
    }
    updateAll(processedOpt.value)
})
</script>

<style scoped>
.chart-container {
    position: relative;
    border: 1px solid transparent;
}
.chart-switch {
    position: absolute;
    right: 20px;
    top: 0px;
    z-index: 9;
}
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
</style>
