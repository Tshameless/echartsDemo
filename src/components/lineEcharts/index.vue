<template>
    <div style="position: relative;border: 1px solid transparent;">
        <n-switch v-model:value="showValue" :round="false" v-if="showTable"
            style="position: absolute; right: 20px;top: 0px;z-index: 9;">
            <template #checked>
                图形
            </template>
            <template #unchecked>
                图表
            </template>
        </n-switch>
        <div class="clearfix">
            <div v-show="showValue" ref="eChartsBoxRef" style="width: 95%;" :style="{ height: `${height}px` }"
                :max-height="`${height}px`"></div>
            <n-data-table v-show="!showValue" style="width: 95%;" :single-line="false" :columns="tableHeader"
                :data="tableData" :max-height="height - 49" striped />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { toRefs, onMounted, ref, onUnmounted, watch, nextTick, computed, shallowRef } from 'vue'
import * as eCharts from 'echarts'
import { debounce } from 'lodash-es'
import type { ChartOptions, LegendSelectChangedEvent } from './types'
import { calcYAxisMax, calcYAxisMin, getYAxisData, calculateCompensateValue } from './utils'
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

// 创建图表实例
const createChartInstance = (): boolean => {
    try {
        // 只在图表不存在或已销毁时才创建新实例
        if (!myChart.value || myChart.value.isDisposed()) {
            // 确保DOM元素存在
            if (!eChartsBoxRef.value) {
                console.warn('ECharts container element not found')
                return false
            }

            // 创建新实例
            myChart.value = eCharts.init(eChartsBoxRef.value as HTMLDivElement)
        }
        return true
    } catch (error) {
        console.error('Failed to initialize ECharts:', error)
        return false
    }
}

// 设置双Y轴图表配置
const setDoubleYAxisOption = (item: ChartOptions): void => {
    const yAxisIndexZeroArr = getYAxisData(item.series!, 0)
    const yAxisIndexOneArr = getYAxisData(item.series!, 1)

    myChart.value!.setOption(getCommonOption(item, {
        yAxis: [
            {
                show: item.showYAxis ?? true,
                name: item.yName ?? 'MW',
                type: item.yType ?? "value",
                nameGap: item.yNameGap ?? 20,
                nameRotate: 0,
                axisLine: {
                    show: true,
                    lineStyle: { color: item.yColor ?? '#fff' }
                },
                axisTick: {
                    show: true,
                    lineStyle: { color: item.yColor ?? '#fff' }
                },
                max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
                min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, yAxisIndexOneArr) : null,
                alignTicks: item.alignTicks ?? false,
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        width: 1,
                        color: 'rgba(223, 223, 223, 0.1)',
                        opacity: 1,
                    }
                },
                axisLabel: item.yAxisLabel ?? {
                    color: item.yColor ?? "#fff",
                    fontSize: item.yFontSize ?? "12px",
                    fontWeight: item.yFontWeight ?? "normal",
                    formatter: item.yFormatter,
                },
                nameTextStyle: { color: '#fff' }
            },
            {
                show: item.showYAxis1 ?? true,
                name: item.yName1 ?? '元',
                type: item.yType1 ?? "value",
                nameGap: item.yNameGapOne ?? 20,
                nameRotate: 0,
                axisLine: {
                    show: true,
                    lineStyle: { color: item.yColor1 ?? '#fff' }
                },
                axisTick: {
                    show: true,
                    lineStyle: { color: item.yColor1 ?? '#fff' }
                },
                max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
                min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, yAxisIndexZeroArr) : null,
                alignTicks: item.alignTicks ?? false,
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        width: 1,
                        color: 'rgba(223, 223, 223, 0.1)',
                        opacity: 1,
                    }
                },
                axisLabel: item.yAxisLabel1 ?? {
                    color: item.yColor1 ?? "#fff",
                    fontSize: item.yFontSize1 ?? "12px",
                    fontWeight: item.yFontWeight1 ?? "normal",
                    formatter: item.yFormatter1,
                },
                nameTextStyle: { color: '#fff' }
            },
        ],
        series: item.series
    }), true)
}

// 设置单Y轴图表配置
const setSingleYAxisOption = (item: ChartOptions): void => {
    myChart.value!.setOption(getCommonOption(item, {
        yAxis: item.yAxis ?? [
            {
                show: item.showYAxis ?? true,
                name: item.yName ?? 'MW',
                type: item.yType ?? "value",
                nameGap: item.yNameGap ?? 20,
                nameRotate: 0,
                axisLine: {
                    show: true,
                    lineStyle: { color: item.yColor ?? '#fff' }
                },
                axisTick: {
                    show: true,
                    lineStyle: { color: item.yColor ?? '#fff' }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        width: 1,
                        color: 'rgba(223, 223, 223, 0.1)',
                        opacity: 1,
                    }
                },
                axisLabel: item.yAxisLabel ?? {
                    color: item.yColor ?? "#fff",
                    fontSize: item.yFontSize ?? "12px",
                    fontWeight: item.yFontWeight ?? "normal",
                    formatter: item.yFormatter,
                },
                nameTextStyle: { color: item.yUnitColor ?? '#fff' }
            },
        ],
        series: item.series
    }), true)
}

// 绑定图例选择事件
const bindLegendEvent = (item: ChartOptions): void => {
    if (!myChart.value) return

    // 移除旧的监听器
    myChart.value.off('legendselectchanged')

    // 绑定新的事件监听器
    myChart.value.on('legendselectchanged', (params) => {
        if (item?.doubleY) {
            updateChartAndCalculateMax(item, params as LegendSelectChangedEvent, myChart.value!);
        }
    });
}

const initStationRef = (item: ChartOptions) => {
    // 创建图表实例
    if (!createChartInstance()) {
        return
    }

    // 设置图表配置
    if (item?.doubleY) {
        setDoubleYAxisOption(item)
    } else {
        setSingleYAxisOption(item)
    }

    // 绑定图例选择事件
    bindLegendEvent(item)

    // 初始化后立即调用一次 resize 确保尺寸正确
    setTimeout(() => {
        resize()
    }, 100)
}

// 图例选择变化处理
const updateChartAndCalculateMax = (item: ChartOptions, name: LegendSelectChangedEvent, myChart: eCharts.ECharts) => {
    let filteredData = item.series;
    if (name) {
        const currentSelected = Object.keys(name.selected).filter(key => name.selected[key]);
        filteredData = item.series?.filter(dataItem => currentSelected.includes(dataItem.name));
    }
    myChart.setOption({
        series: filteredData
    });
    calculateMax({ ...item, series: filteredData }, myChart);
};

// 计算y轴上下限
const calculateMax = (item: ChartOptions, myChart: eCharts.ECharts) => {
    let yAxisIndexZeroArr: Array<number | null> = []
    let yAxisIndexOneArr: Array<number | null> = []

    item.series?.forEach(seriesData => {
        if (seriesData.yAxisIndex === 0) {
            yAxisIndexZeroArr = yAxisIndexZeroArr.concat(seriesData.data);
        } else if (seriesData.yAxisIndex === 1) {
            yAxisIndexOneArr = yAxisIndexOneArr.concat(seriesData.data);
        }
    });

    // 更新图表配置
    myChart.setOption({
        yAxis: [
            {
                max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
                min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, yAxisIndexOneArr) : null,
            },
            {
                max: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMax(value) : null,
                min: item.xAlignValue ? (value: { min: number; max: number }) => calcYAxisMin(value, yAxisIndexZeroArr) : null,
            }
        ],
    });
};

defineExpose({ resizeHandler: resize })

onMounted(() => {
    initStationRef(processedOpt.value)

    if (props.opt.showTable !== undefined) {
        showTable.value = props.opt.showTable
        if (showTable.value) {
            calculateTableData(processedOpt.value)
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

// 防抖的图表更新函数（不销毁重建，只更新配置）
const debouncedInitChart = debounce((newVal: ChartOptions) => {
    if (newVal && Object.keys(newVal).length > 0) {
        // showValue.value = true // 移除强制切换逻辑
        calculateTableData(newVal)
        initStationRef(newVal)

        nextTick(() => {
            setTimeout(() => {
                if (myChart.value && !myChart.value.isDisposed()) {
                    myChart.value.resize()
                }
            }, 50)
        })
    }
}, 50)

watch(() => processedOpt.value, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
        // showValue.value = true // 移除强制切换逻辑，保留用户当前选择的视图
        debouncedInitChart(newVal)
    }
}, { deep: true, immediate: false })
</script>
