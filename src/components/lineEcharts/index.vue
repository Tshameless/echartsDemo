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

/** 核心更新函数 */
const updateAll = (config: ChartOptions) => {
    // 更新 ECharts 配置
    finalOption.value = getFinalOption(config)
    
    // 如果表格开启，则更新表格数据
    if (showTable.value) {
        calculateTableData(config)
    }
}

// 防抖处理配置变化
const debouncedUpdate = debounce((newVal: ChartOptions) => {
    if (newVal && Object.keys(newVal).length > 0) {
        updateAll(newVal)
    }
}, 50)

// 监听配置对象变化
watch(() => processedOpt.value, (newVal) => {
    debouncedUpdate(newVal)
}, { deep: true, immediate: true })

// 暴露 API
defineExpose({
    resize: () => rendererRef.value?.resize()
})

onMounted(() => {
    // 初始化同步显示状态
    if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
    }
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
