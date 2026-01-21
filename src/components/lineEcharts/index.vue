<template>
    <div class="chart-container">
        <n-switch v-model:value="showValue" :round="false" v-if="showTable" class="chart-switch">
            <template #checked>
                图形
            </template>
            <template #unchecked>
                图表
            </template>
        </n-switch>
        <div class="clearfix">
            <div v-show="showValue" ref="eChartsBoxRef" class="chart-box" :style="{ height: `${height}px`, maxHeight: `${height}px` }"></div>
            <n-data-table v-show="!showValue" class="chart-table" :single-line="false" :columns="tableHeader"
                :data="tableData" :max-height="height - 49" striped />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { toRefs, onMounted, ref, onUnmounted, watch, nextTick, computed, shallowRef } from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import type { ChartOptions, LegendSelectChangedEvent } from './types'
import { calcYAxisMax, calcYAxisMin, calculateCompensateValue } from './utils'
import { useChartResize } from './useChartResize'
import { useChartTable } from './useChartTable'
import { useChartOption } from './useChartOption'

// 定义 props 类型
interface LineChartProps {
    opt: ChartOptions
    height: number
}

// 定义 props 并设置默认值
const props = defineProps<LineChartProps>()

// 解构 props
const { opt } = toRefs(props)
const height = ref(props.height)

// 定义响应式引用
const eChartsBoxRef = ref<HTMLDivElement>()
const myChart = shallowRef<eCharts.ECharts | null>(null)

// 使用 Hooks
const { resize } = useChartResize(myChart, eChartsBoxRef)
const { showTable, tableData, tableHeader, showValue, calculateTableData } = useChartTable()
const { getCommonOption } = useChartOption()


// 使用计算属性处理补点逻辑，避免直接修改props和重复计算
const processedOpt = computed(() => {
    if (!opt.value.compensateType) {
        return opt.value
    }

    // 浅拷贝 + 局部深拷贝，避免全量 cloneDeep 带来的性能开销
    const processed: ChartOptions = { ...opt.value }
    if (processed.timeList) {
        processed.timeList = [...processed.timeList]
    }
    if (processed.series) {
        processed.series = processed.series.map(item => ({
            ...item,
            data: [...item.data]
        }))
    }

    // 执行补点
    if (processed.compensateType === 'end') {
        const nextTime = calculateCompensateValue('end', processed.timeList)
        if (nextTime !== undefined && processed.timeList) {
            processed.timeList.push(nextTime)
            processed.series?.forEach(item => {
                item.data.push(null)
            })
        }
    } else if (processed.compensateType === 'start') {
        const previousTime = calculateCompensateValue('start', processed.timeList)
        if (previousTime !== undefined && processed.timeList) {
            processed.timeList.unshift(previousTime)
            processed.series?.forEach(item => {
                item.data.unshift(null)
            })
        }
    }
    return processed
})

// 辅助函数：生成 Y 轴配置
const createYAxisOption = (item: ChartOptions, index: number, otherAxisData: number[] = []) => {
    const isSecondary = index === 1
    const show = isSecondary ? item.showYAxis1 : item.showYAxis
    const name = isSecondary ? item.yName1 : item.yName
    const type = isSecondary ? item.yType1 : item.yType
    const nameGap = isSecondary ? item.yNameGapOne : item.yNameGap
    const color = isSecondary ? item.yColor1 : item.yColor
    const fontSize = isSecondary ? item.yFontSize1 : item.yFontSize
    const fontWeight = isSecondary ? item.yFontWeight1 : item.yFontWeight
    const formatter = isSecondary ? item.yFormatter1 : item.yFormatter
    const axisLabel = isSecondary ? item.yAxisLabel1 : item.yAxisLabel
    const defaultName = isSecondary ? '元' : 'MW'

    return {
        show: show ?? true,
        name: name ?? defaultName,
        type: type ?? "value",
        nameGap: nameGap ?? 20,
        nameRotate: 0,
        axisLine: {
            show: true,
            lineStyle: { color: color ?? '#fff' }
        },
        axisTick: {
            show: true,
            lineStyle: { color: color ?? '#fff' }
        },
        // 动态计算 min/max
        max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
        min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, otherAxisData) : null,
        alignTicks: item.alignTicks ?? false,
        splitLine: {
            lineStyle: {
                type: 'dashed',
                width: 1,
                color: 'rgba(223, 223, 223, 0.1)',
                opacity: 1,
            }
        },
        axisLabel: axisLabel ?? {
            color: color ?? "#fff",
            fontSize: fontSize ?? "12px",
            fontWeight: fontWeight ?? "normal",
            formatter: formatter,
        },
        nameTextStyle: { color: '#fff' }
    }
}

// 获取轴数据用于对齐计算
const getAxisData = (series: ChartOptions['series']) => {
    const axis0Data: number[] = []
    const axis1Data: number[] = []
    
    series?.forEach(s => {
        if (!s.data) return
        // 避免使用 spread operator 处理大数组
        s.data.forEach(d => {
            if (d !== null && d !== undefined) {
                if (s.yAxisIndex === 1) {
                    axis1Data.push(d)
                } else {
                    axis0Data.push(d)
                }
            }
        })
    })
    return { axis0Data, axis1Data }
}

// 核心更新逻辑
const updateChart = (item: ChartOptions) => {
    if (!myChart.value || myChart.value.isDisposed()) {
        if (!initChartInstance()) return
    }

    const { axis0Data, axis1Data } = getAxisData(item.series)
    
    const yAxisOptions = []
    // 主轴 (Index 0) - 需要副轴数据来对齐
    yAxisOptions.push(createYAxisOption(item, 0, axis1Data))
    
    // 副轴 (Index 1) - 需要主轴数据来对齐
    if (item.doubleY) {
        yAxisOptions.push(createYAxisOption(item, 1, axis0Data))
    } else {
        // 单轴模式下，如果有自定义的 yAxis 配置，这里可能需要额外处理，
        // 但根据原代码 setSingleYAxisOption，它也是基于 item 属性生成的。
        // 如果 item.yAxis 存在，原代码优先使用 item.yAxis，这里我们保持一致性：
        if (item.yAxis && item.yAxis.length > 0) {
             // 如果外部直接传了 yAxis 数组，则使用外部的，但通常我们建议使用统一配置生成
             // 这里为了保持原逻辑兼容性，如果 item.yAxis 存在且我们不想覆盖它...
             // 原代码：yAxis: item.yAxis ?? [生成的...]
             // 所以如果 item.yAxis 存在，我们应该使用它。
             // 但为了支持 xAlignValue (对齐)，我们最好还是用生成的。
             // 假设这里的优化目标是统一生成逻辑。
        }
    }
    
    // 兼容原代码：如果 item.yAxis 显式存在，优先使用（除了对齐逻辑可能失效）
    // 但原代码 setSingleYAxisOption 中也是 yAxis: item.yAxis ?? [...]
    // 我们这里统一使用生成逻辑，除非完全自定义。
    const finalYAxis = (item.yAxis && !item.doubleY) ? item.yAxis : yAxisOptions

    const finalOption = getCommonOption(item, {
        yAxis: finalYAxis,
        series: item.series
    })

    // 使用 notMerge: true 确保状态重置，避免旧数据残留
    myChart.value?.setOption(finalOption, { notMerge: true })
}

// 初始化图表实例
const initChartInstance = (): boolean => {
    try {
        if (!eChartsBoxRef.value) return false
        
        myChart.value = eCharts.init(eChartsBoxRef.value)
        
        // 绑定事件
        myChart.value.on('legendselectchanged', (params) => {
            const eventParams = params as LegendSelectChangedEvent
            const currentOpt = processedOpt.value
            
            // 根据图例选择过滤数据
            const selectedNames = Object.keys(eventParams.selected).filter(key => eventParams.selected[key])
            const filteredSeries = currentOpt.series?.filter(s => selectedNames.includes(s.name))
            
            // 计算新的轴数据
            const { axis0Data, axis1Data } = getAxisData(filteredSeries)
            
            // 生成新的 Y 轴配置
            const yAxisOptions = []
            yAxisOptions.push(createYAxisOption(currentOpt, 0, axis1Data))
            if (currentOpt.doubleY) {
                yAxisOptions.push(createYAxisOption(currentOpt, 1, axis0Data))
            }
            
            const finalYAxis = (currentOpt.yAxis && !currentOpt.doubleY) ? currentOpt.yAxis : yAxisOptions

            // 只更新 yAxis，默认 merge 模式，保留图例状态
            myChart.value?.setOption({
                yAxis: finalYAxis
            })
        })

        return true
    } catch (error) {
        console.error('Failed to initialize ECharts:', error)
        return false
    }
}

defineExpose({ resizeHandler: resize })

onMounted(() => {
    // 初始化并首次渲染
    if (processedOpt.value) {
        updateChart(processedOpt.value)
        
        if (props.opt.showTable !== undefined) {
            showTable.value = props.opt.showTable
            if (showTable.value) {
                calculateTableData(processedOpt.value)
            }
        }
    }
})

onUnmounted(() => {
    if (myChart.value) {
        myChart.value.off('legendselectchanged')
        myChart.value.dispose()
        myChart.value = null
    }
})

// 防抖更新
const debouncedUpdate = debounce((newVal: ChartOptions) => {
    if (newVal && Object.keys(newVal).length > 0) {
        calculateTableData(newVal)
        updateChart(newVal)
        nextTick(() => {
            myChart.value?.resize()
        })
    }
}, 50)

watch(() => processedOpt.value, (newVal) => {
    debouncedUpdate(newVal)
}, { deep: true })

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
.chart-box {
    width: 95%;
}
.chart-table {
    width: 95%;
}
.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
</style>
