<template>
    <div class="chart-container">
        <!-- 切换开关 -->
        <n-switch v-model:value="isChartView" :round="false" v-if="showTable" class="chart-switch">
            <template #checked>图形</template>
            <template #unchecked>图表</template>
        </n-switch>

        <div class="clearfix">
            <!-- 图形渲染器 -->
            <ChartRenderer 
                v-show="isChartView"
                ref="rendererRef"
                :option="finalOption" 
                :height="height" 
                @legend-select-changed="handleLegendChange"
            />

            <!-- 表格渲染器 -->
            <DataTableRenderer 
                v-show="!isChartView"
                :columns="tableHeader"
                :data="tableData"
                :height="height"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, toRefs, computed, watchEffect } from 'vue'
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

// 1. 逻辑抽离：数据预处理（补点逻辑）
const { processedOpt } = useProcessedData(opt)

// 2. 逻辑抽离：ECharts Option 生成逻辑
const { getFinalOption } = useChartOption()

// 3. 逻辑抽离：表格逻辑
const { showTable, tableData, tableHeader, isChartView, calculateTableData } = useChartTable()

/** 图例选中状态映射 */
const selectedLegends = ref<Record<string, boolean>>({})

/** 
 * 核心配置生成 (Computed)
 * 声明式地根据原始配置、预处理数据和图例选中状态生成最终 Option
 */
const finalOption = computed(() => {
    return getFinalOption(processedOpt.value, selectedLegends.value)
})

/** 响应图例切换：仅更新内部选中状态，触发 finalOption 自动重新计算 */
const handleLegendChange = (params: any) => {
    selectedLegends.value = params.selected
}

/** 
 * 监听配置同步
 * 确保外部 props 变化时，内部状态（如显示开关）能实时同步
 */
watchEffect(() => {
    if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
    }
})

/** 
 * 数据变更副作用
 * 当核心数据变化时，同步触发表格数据的计算逻辑
 */
watch(() => [processedOpt.value.series, processedOpt.value.timeList], () => {
    calculateTableData(processedOpt.value)
}, { deep: true, immediate: true })

// 暴露 API
defineExpose({
    resize: () => rendererRef.value?.resize()
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
