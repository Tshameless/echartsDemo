<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import type { ChartOptions, TableColumn } from './types'

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

defineSlots<{
    table?(props: {
        dataTableColumns: TableColumn[]
        tableRows: Array<Record<string, unknown>>
        tableMaxHeight: number | string
    }): any
}>()

const { opt } = toRefs(props)
const rendererRef = ref<InstanceType<typeof ChartRenderer>>()

// 1. 逻辑抽离：数据预处理（补点逻辑）
const { processedOpt } = useProcessedData(opt)

// 2. 逻辑抽离：ECharts Option 生成逻辑
const { getFinalOption } = useChartOption()

// 3. 逻辑抽离：表格逻辑 (直接传入配置引用)
const { showTable, tableData, tableHeader, isChartView } = useChartTable(processedOpt)

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

// 暴露 API
defineExpose({
    resize: () => rendererRef.value?.resize()
})
</script>

<template>
    <div class="chart-container">
        <div v-if="showTable" class="custom-switch">
            <span :class="['switch-item', { active: isChartView }]" @click="isChartView = true">图</span>
            <span class="switch-separator">/</span>
            <span :class="['switch-item', { active: !isChartView }]" @click="isChartView = false">表</span>
        </div>

        <div class="clearfix">
            <ChartRenderer
                v-show="isChartView"
                ref="rendererRef"
                :option="finalOption"
                :height="height"
                @legend-select-changed="handleLegendChange"
            />

            <div v-show="!isChartView">
                <slot
                    name="table"
                    v-bind="{ dataTableColumns: tableHeader, tableRows: tableData, tableMaxHeight: height }"
                >
                    <DataTableRenderer :columns="tableHeader" :data="tableData" :height="height" />
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    position: relative;
    border: 1px solid transparent;
}

.custom-switch {
    position: absolute;
    right: 20px;
    top: 0px;
    z-index: 9;
    display: flex;
    align-items: center;
    background: #f4f6fa;
    padding: 2px;
    border-radius: 4px;
    font-size: 14px;
    user-select: none;
}

.switch-item {
    cursor: pointer;
    padding: 2px 8px;
    border-radius: 4px;
    color: #909399;
    transition: all 0.3s;
    font-weight: 500;
}

.switch-item.active {
    background: #ffffff;
    color: #6e7eee;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.switch-separator {
    margin: 0 2px;
    color: #dcdfe6;
    font-size: 12px;
}

.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
</style>
