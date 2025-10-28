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
            <n-data-table v-show="!showValue" style="width: 95%;" :single-line="false" :columns="eChartsTableHeader"
                :data="eChartsTableData" :max-height="height - 49" striped />
        </div>
    </div>
</template>
<!-- <template>
  <div style="position: relative;border: 1px solid transparent;">
    <div class="station-chart-header">
      <div class="chart-controls">
        <div class="chart-switch-group" v-if="showTable">
          <div class="chart-switch-btn" :class="{ active: showValue === true }" @click="showValue = !showValue">
            <span>图</span>
          </div>
          <span class="chart-switch-divider">
            /
          </span>
          <div class="chart-switch-btn" :class="{ active: showValue === false }" @click="showValue = !showValue">
            <span>表</span>
          </div>
        </div>
      </div>
    </div>
    <div class="clearfix">
      <div v-show="showValue" ref="eChartsBoxRef" style="width: 100%;" :style="{ height: `${height}px` }"
        :max-height="`${height}px`"></div>
      <el-table v-show="!showValue" :data="eChartsTableData" style="width: 100%;" :style="{ height: `${height}px` }"
        :stripe="true" :border="true">
        <el-table-column :prop="item.key" :label="item.title" v-for="item in eChartsTableHeader" />
      </el-table>
    </div>
  </div>
</template> -->
<script lang="ts" setup>
import { toRefs, onMounted, ref, onUnmounted, watch, nextTick } from 'vue'
import * as eCharts from 'echarts'
import dayjs from 'dayjs'
// 定义颜色常量
const itemColorArr = ['red', '#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']

// 定义 props 类型
interface LineChartProps {
    opt: ChartOptions
    height: number
}
interface AxisLabel {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
}
interface TableColumn {
    title: string;
    key: string;
}
//params类型
interface LegendSelectChangedEvent {
    name: string;
    selected: Record<string, boolean>;
    type: string;
}
// 定义图表选项类型
interface ChartOptions {
    doubleY?: boolean //默认为单Y轴，在子组件中赋值为true
    tooltipShow?: boolean //默认开启提示
    tooltipTrigger?: string //默认为 axis
    tooltipBackgroundColor?: string //默认提示背景色
    tooltipBorderColor?: string //默认提示边框色
    tooltipColor?: string //默认提示文字色
    tooltipFormatter?: (params: any) => string //默认提示格式化器,对于有特殊需求时，可自定义，如果需要修改组件的统一提示，请修改defaultTooltipFormatter函数
    legendshowValue?: boolean //默认显示图例
    legend?: object //图例配置
    legendLocation?: string //默认图例水平方向位置
    legendTop?: string //默认图例距离顶部
    legendOrient?: string //默认图例方向
    legendItemWidth?: number //默认图例项宽度
    legendItemHeight?: number //默认图例项高度
    legendRich?: Record<string, any> //默认图例项样式
    legendFormatter?: (name: string) => string //默认图例格式化器，可以通过在组件中自定义legendFormatter修改，也可以在legendRich统一修改legend样式
    dataZoom?: Array<any>//默认数据缩放,如果参数为空，则不显示，也可以在这里自定义数据缩放
    dataZoomShow?: boolean //默认数据缩放不显示
    dataZoomBottom?: string //默认数据缩放距离顶部
    dataZoomStart?: number, //默认数据缩放开始
    dataZoomEnd?: number, //默认数据缩放结束
    dataZoomHeight?: number //默认数据缩放高度
  tooltip?: { //默认提示框
    trigger?: string //默认提示框触发方式
    axisPointer?: { //默认提示框坐标轴指示器
      type?: string //默认提示框坐标轴指示器类型
    }
  }
    grid?: { //默认图表区域
    top?: string | number //默认图表区域距离顶部
    left?: string | number //默认图表区域距离左侧
    right?: string | number //默认图表区域距离右侧
    bottom?: string | number //默认图表区域距离底部
        containLabel?: boolean //默认图表区域是否包含标签
    }
    xAxis?: Array<any> //默认X轴，可以自定义整个X轴，也可以修改单个X轴的属性
    showXAxis?: boolean //默认显示X轴
    xName?: string //默认X轴名称
    xType?: string //默认X轴类型
    boundaryGap?: boolean //默认X轴是否间距
    xAxisLabel?: AxisLabel //默认X轴标签样式，可以修改单个X轴标签的样式，也可以统一修改
  timeList?: Array<string | number> //默认时间轴
    xColor?: string //默认X轴标签颜色
    xUnitColor?: string //默认X轴标签单位
    xFontSize?: string //默认X轴标签字体大小
    xFontWeight?: string //默认X轴标签字体粗细
    xNameGap?: number //默认X轴名称距离左侧
    xNameLocation?: string //默认X轴名称位置
    yAxis?: Array<any> //默认Y轴，可以自定义整个Y轴，也可以修改单个Y轴的属性
    alignTicks?: boolean //默认Y轴是否对齐,只有doubleY为true时生效,当这个为true的时候，且要求xAlignValue也为true，那么y轴两侧的数据会不能正确包含数据的上下限
    xAlignValue?: boolean//当双Y轴时，需要两侧的0轴对齐
    showYAxis?: boolean //默认显示Y轴
    yName?: string //默认Y轴名称
    yType?: string //默认Y轴类型
    compensateType?: string //补点类型,end:向后补点,start:向前补点,不传就是不补点,如果添加了这个参数进行了补点，且使用了表格，那么有个调用deleteLastPoint或者是deleteFirstPoint来删除首/尾点
    yAxisLabel?: AxisLabel //默认y轴标签样式，可以修改单个y轴标签的样式，也可以统一修改
    yColor?: string //默认Y轴标签颜色
    yUnitColor?: string //默认Y轴标签单位
    yFontSize?: string //默认Y轴标签字体大小
    yFontWeight?: string //默认Y轴标签字体粗细
    yFormatter?: (value: number) => string //默认Y轴格式化器，可以通过在组件中自定义yFormatter修改，也可以在yAxisRich统一修改y轴样式
    yAccuracy?: number //默认Y轴精度
    yNameGap?: number //默认Y轴名称距离顶部
    showYAxis1?: boolean //默认显示Y轴1
    yName1?: string //默认Y轴1名称
    yType1?: string //默认Y轴1类型
    yAxisLabel1?: AxisLabel //默认y轴标签样式，可以修改单个y轴标签的样式，也可以统一修改
    yColor1?: string //默认Y轴1标签颜色
    yFontSize1?: string //默认Y轴1标签字体大小
    yFormatter1?: (value: number) => string //默认Y轴格式化器，可以通过在组件中自定义yFormatter修改，也可以在yAxisRich统一修改y轴样式
    yFontWeight1?: string
    yAccuracy1?: number //默认Y轴1精度
    yNameGapOne?: number //默认Y轴1名称距离顶部
    data?: Array<ChartSeriesData> //默认数据
    title?: string //默认图表标题
    deleteLastPoint?: boolean //删除最后一个数据点
    deleteFirstPoint?: boolean //删除第一个数据点
    showTable?: boolean //默认显示表格
    visualMap?: boolean
}

// 定义图表系列数据类型
interface ChartSeriesData {
    name: string  //系列名称
    type: string   //系列类型
    stack?: string  //堆叠
    yAxisIndex?: number  //Y轴索引，只有doubleY为true时生效，否则不传这个属性
    data: Array<number | null>  //数据
    tableUnit?: string  //表格列单位
}

// 定义 props 并设置默认值
const props = defineProps<LineChartProps>()

// 解构 props
const { opt } = toRefs(props)
const height = ref(props.height)

// 定义响应式引用
const eChartsBoxRef = ref<HTMLDivElement>()
const showTable = ref(false)
let eChartsTableData = ref<Array<Record<string, any>>>([])
const eChartsTableHeader = ref<TableColumn[]>([])
let showValue = ref(true)
//y轴上下限计算函数
const calcYAxisMax = (value: { max: number, min: number }) => {
    // 计算绝对值较大者的1.2倍作为最大值
    const maxAbs = Math.max(Math.abs(value.max), Math.abs(value.min));
    return parseFloat((maxAbs * 1.2).toFixed(2));
}

const calcYAxisMin = (value: { max: number, min: number }, arr: Array<number | null>) => {
    // 获取对侧轴的数据范围
    const validArr = arr.filter(v => v !== null) as number[];
    
    // 如果没有对侧数据，单独处理
    if (validArr.length === 0) {
        return value.min >= 0 ? 0 : -calcYAxisMax(value);
    }
    const otherMax = Math.max(...validArr);
    const otherMin = Math.min(...validArr);
    console.log('对侧轴数据:', otherMax, otherMin, '当前轴数据:', value);
    
    // 计算当前轴和对侧轴的最大值
    const currentMax = calcYAxisMax(value);
    const otherAxisMax = Math.max(Math.abs(otherMax), Math.abs(otherMin)) * 1.2;
    
    // 计算实际数据中负数的占比（用于对齐0点）
    const currentDataMin = value.min < 0 ? Math.abs(value.min) * 1.2 : 0;
    const otherDataMin = otherMin < 0 ? Math.abs(otherMin) * 1.2 : 0;
    
    // 计算两侧数据的0点位置比例
    const currentZeroRatio = currentDataMin / (currentMax + currentDataMin);
    const otherZeroRatio = otherDataMin / (otherAxisMax + otherDataMin);
    
    console.log('当前0点比例:', currentZeroRatio, '对侧0点比例:', otherZeroRatio);
    
    // 取两者中较大的比例（确保负数空间足够）
    const targetZeroRatio = Math.max(currentZeroRatio, otherZeroRatio);
    
    // 如果目标比例为0，说明两侧都没有负数
    if (targetZeroRatio === 0) {
        return 0;
    }
    
    // 根据目标比例计算当前轴的最小值
    // targetZeroRatio = |min| / (max + |min|)
    // 推导：|min| = targetZeroRatio * max / (1 - targetZeroRatio)
    const calculatedMin = targetZeroRatio * currentMax / (1 - targetZeroRatio);
    const result = -parseFloat(calculatedMin.toFixed(2));
    
    console.log('计算结果 min:', result, 'max:', currentMax, '验证0点位置:', Math.abs(result) / (currentMax + Math.abs(result)));
    return result;
}

// 初始化图表
let myChart: echarts.ECharts | null = null
// 定义 resize 处理函数，使用响应式方式确保总是引用最新的 chart 实例
const resizeHandler = () => { 
  if (myChart && !myChart.isDisposed()) {
    myChart.resize()
  } else {
    console.warn('⚠️ 图表 resize 失败：图表实例不存在或已销毁')
  }
}
// 销毁图表实例
const disposeChart = () => {
  if (myChart) {
    myChart.off('legendselectchanged') // 移除事件监听器
    window.removeEventListener("resize", resizeHandler) // 清理 resize 监听
    myChart.dispose()
    myChart = null
  }
}
// 去判断是否需要向前或者是向后延申补点
const judgeCompensateType = () => {
  if (opt.value.compensateType === 'end') {
    // 动态计算下一个时间点（向后）
    const nextTime = judgeCompensateTimeType('end')
    if (nextTime) {
      opt.value.timeList.push(nextTime)
      opt.value.data.forEach(item => {
        item.data.push(null)
      })
    }

  } else if (opt.value.compensateType === 'start') {
    // 动态计算上一个时间点（向前）
    const previousTime = judgeCompensateTimeType('start')
    if (previousTime) {
      opt.value.timeList.unshift(previousTime)
      opt.value.data.forEach(item => {
        item.data.unshift(null)
      })
    }

  }

}
// 判断补点时间类型
// direction: 'start' 向前补点, 'end' 向后补点
const judgeCompensateTimeType = (direction: 'start' | 'end' = 'end') => {
  const timeList = opt.value.timeList
  if (!timeList || timeList.length < 2) return
  
  let firstTime: string, secondTime: string
  
  if (direction === 'end') {
    // 向后补点：取最后两个时间
    firstTime = String(timeList[timeList.length - 2])
    secondTime = String(timeList[timeList.length - 1])
  } else {
    // 向前补点：取前两个时间
    firstTime = String(timeList[0])
    secondTime = String(timeList[1])
  }
  
  // 特殊处理 24:00 格式（将其转换为 00:00 并标记需要加一天）
  const handleSpecialTime = (time: string) => {
    if (time === '24:00' || time === '24:00:00') {
      return { time: time.replace('24:', '00:'), addDay: true }
    }
    return { time, addDay: false }
  }
  
  const firstTimeInfo = handleSpecialTime(firstTime)
  const secondTimeInfo = handleSpecialTime(secondTime)
  
  firstTime = firstTimeInfo.time
  secondTime = secondTimeInfo.time
  
  // 检测原始时间格式
  const timeFormat = detectTimeFormat(firstTime)
  
  // 判断是否为纯时间格式（无日期）
  const isTimeOnly = /^(\d{1,2}):(\d{2})(:\d{2})?$/.test(firstTime)
  
  let firstDayjs, secondDayjs
  
  if (isTimeOnly) {
    // 对于纯时间格式，添加临时日期进行计算
    const baseDate = '2024-01-01'
    firstDayjs = dayjs(`${baseDate} ${firstTime}`, `YYYY-MM-DD ${timeFormat}`)
    secondDayjs = dayjs(`${baseDate} ${secondTime}`, `YYYY-MM-DD ${timeFormat}`)
    
    // 如果原始时间是 24:00，加一天
    if (firstTimeInfo.addDay) {
      firstDayjs = firstDayjs.add(1, 'day')
    }
    if (secondTimeInfo.addDay) {
      secondDayjs = secondDayjs.add(1, 'day')
    }
    
    // 处理跨天的情况
    if (secondDayjs.isBefore(firstDayjs)) {
      secondDayjs = secondDayjs.add(1, 'day')
    }
  } else {
    // 包含日期的格式直接解析
    firstDayjs = dayjs(firstTime, timeFormat)
    secondDayjs = dayjs(secondTime, timeFormat)
  }
  
  // 验证解析是否成功
  if (!firstDayjs.isValid() || !secondDayjs.isValid()) {
    console.error('时间解析失败:', { firstTime, secondTime, timeFormat })
    return
  }
  
  // 计算两个时间的差值（毫秒）
  const diffInMilliseconds = secondDayjs.diff(firstDayjs)
  
  // 根据方向计算新时间
  let newTime
  if (direction === 'end') {
    // 向后补点：在第二个时间上加上差值
    newTime = secondDayjs.add(diffInMilliseconds, 'millisecond')
  } else {
    // 向前补点：在第一个时间上减去差值
    newTime = firstDayjs.subtract(diffInMilliseconds, 'millisecond')
  }
  
  // 返回与原格式一致的时间字符串
  let resultTime = newTime.format(timeFormat)
  
  // 如果结果是第二天的 00:00 且原始格式支持 24:00，则转换回 24:00
  if (isTimeOnly && resultTime === '00:00') {
    const baseDate = dayjs('2024-01-01')
    if (newTime.date() > baseDate.date()) {
      resultTime = '24:00'
    }
  }
  
  return resultTime
}

// 检测时间格式
const detectTimeFormat = (timeStr: string | number): string => {
  const str = String(timeStr).trim()
  
  // 常见时间格式匹配（按从具体到通用的顺序）
  if (/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2}$/.test(str)) {
    return 'YYYY-MM-DD HH:mm:ss'
  } else if (/^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}$/.test(str)) {
    return 'YYYY-MM-DD HH:mm'
  } else if (/^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2}:\d{2}$/.test(str)) {
    return 'YYYY/MM/DD HH:mm:ss'
  } else if (/^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2}$/.test(str)) {
    return 'YYYY/MM/DD HH:mm'
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return 'YYYY-MM-DD'
  } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
    return 'YYYY/MM/DD'
  } else if (/^\d{2}-\d{2} \d{1,2}:\d{2}$/.test(str)) {
    return 'MM-DD HH:mm'
  } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    // 支持单双数字小时（如 "0:00:00" 或 "00:00:00"）
    return 'HH:mm:ss'
  } else if (/^\d{1,2}:\d{2}$/.test(str)) {
    // 支持单双数字小时（如 "0:00" 或 "00:00"）
    return 'HH:mm'
  }
  
  // 默认返回 HH:mm 格式
  return 'HH:mm'
}
const initStationRef = (item: ChartOptions) => {
   try {
    // 先销毁旧的实例
    disposeChart()
    
    // 确保DOM元素存在
    if (!eChartsBoxRef.value) {
      console.warn('ECharts container element not found')
      return
    }
    
    // 创建新实例
    myChart = eCharts.init(eChartsBoxRef.value as HTMLDivElement)
  } catch (error) {
    console.error('Failed to initialize ECharts:', error)
    return
  }    // 工具函数
    const getYAxisData = (data: Array<ChartSeriesData>, yAxisIndex: number) =>
        data.filter(d => d.yAxisIndex == yAxisIndex).flatMap(d => d.data).filter(val => val !== null) as number[]
    const getMax = (arr: Array<number>) =>
        arr.length ? (Math.max(...arr) > 1 ? parseFloat((Math.max(...arr) * 1.1).toFixed(0)) : parseFloat((Math.max(...arr) * 1.1).toFixed(2))) : 100

    const getMin = (arr: Array<number>) =>
        arr.length ? (Math.min(...arr) > 0 ? 0 : parseFloat(Math.min(...arr).toFixed(0))) : 0

    // 默认提示格式化器
    const defaultTooltipFormatter = (params: any, item: ChartOptions, isDoubleY = false): string => {
        let result
        if (item.xName && item.xName !== '时间' && item.xName !== '日期') {
            result = `<div style="margin:2px 0 0 5px; color:#fff">${params[0].axisValue}${item.xName}</div>`
        } else {
            result = `<div style="margin:2px 0 0 5px; color:#fff">${params[0].axisValue}</div>`
        }
        result += (params as any[]).map((param: any) => {
            let yUnit = ''
            if (isDoubleY) {
                const series = item.data?.find(d => d.name === param.seriesName)
                if (series) {
                    yUnit = (series.yAxisIndex ?? 1) === 0 ? (item.yName?.includes('：') ? item.yName.split('：')[1] || '' : item.yName || '') : (item.yName1?.includes('：') ? item.yName1.split('：')[1] || '' : item.yName1 || '')
                }
            } else {
                yUnit = item.yName?.includes('：') ? (item.yName.split('：')[1] || '') : (item.yName || '');
            }
            return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff"><div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>${param.seriesName}：${param.value != null ? param.value : '--'}${yUnit}</div>`
        }).join('<br>')
        return result
    }
    // 公共 option 生成
    const getCommonOption = (item: ChartOptions, extra = {}) => ({
        tooltip: {
            show: item.tooltipShow ?? true,
            trigger: item.tooltipTrigger ?? 'axis',
            backgroundColor: item.tooltipBackgroundColor ?? "rgba(0,0,0,.3)",
            borderColor: item.tooltipBorderColor ?? "rgba(0,0,0,.3)",
            textStyle: { color: item.tooltipColor ?? "rgba(255, 255, 255, 1)" },
            formatter: item.tooltipFormatter || (params => defaultTooltipFormatter(params, item, !!item.doubleY)),
            axisPointer: {
                label: { backgroundColor: '#6a7985' }
            }
        },
        legend:item.legend ? item.legend : {
            show: item.legendshowValue ?? true,
            left: item.legendLocation ?? 'center',
            top: item.legendTop ?? 'top',
            orient: item.legendOrient ?? 'horizontal',
            itemWidth: item.legendItemWidth ?? 30,
            itemHeight: item.legendItemHeight ?? 14,
            textStyle: {
                // color: itemColorArr,
                color: '#fff',
                fontSize: 12,
                rich: item.legendRich ?? {
                    one: { width: 60, height: 16, fontSize: 12, fontWeight: 700 },
                }
            },
            formatter: item.legendFormatter ?? (name => `{one|${name}}`),
        },
        color: itemColorArr,
        dataZoom: item.dataZoom ?? [
            {
                type: "slider",
                show: item.dataZoomShow ?? false,
                realtime: true,
                start: item.dataZoomStart ?? 0,
                end: item.dataZoomEnd ?? 100,
                bottom: item.dataZoomBottom ?? 15,
                height: item.dataZoomHeight ?? 25,
            },
            {
                type: "inside",
                realtime: true,
                start: item.dataZoomStart ?? 0,
                end: item.dataZoomEnd ?? 100,
            },
        ],
        visualMap: item.visualMap ? item.visualMap : [],
        grid: item.grid ?? {
            left: '3%',
            right: '5%',
            bottom: '12%',
            containLabel: true
        },
        xAxis: item.xAxis ?? [
            {
                show: item.showXAxis ?? true,
                name: item.xName ?? '时间',
                type: item.xType ?? 'category',
                boundaryGap: item.boundaryGap ?? false,
                data: item.timeList,
                axisLabel: item.xAxisLabel ?? {
                    color: item.xColor ?? "#fff",
                    fontSize: item.xFontSize ?? "12px",
                    fontWeight: item.xFontWeight ?? "normal",
                    showMinLabel: item.compensateType === 'start' ? true : null,  // 如果补点了强制显示第一个标签（向前补点），否则自动判断
                    showMaxLabel: item.compensateType === 'end' ? true : null,  // 强制显示最后一个标签（向后补点），否则自动判断
                },
                nameTextStyle: {
                    color: item.xUnitColor ?? '#fff',
                    verticalAlign: 'top',
                    padding: [8, 0, 0, 0]
                },
                nameGap: item.xNameGap ?? 20,
                nameLocation: item.xNameLocation ?? 'end'
            }
        ],
        ...extra
    })

    if (item?.doubleY) {//双Y轴
        const yAxisIndexZeroArr = getYAxisData(item.data!, 0)
        const yAxisIndexOneArr = getYAxisData(item.data!, 1)
        myChart.setOption(getCommonOption(item, {
            yAxis: [
                {
                    show: item.showYAxis ?? true,
                    name: item.yName ?? 'MW',
                    type: item.yType ?? "value",
                    nameGap: item.yNameGap ?? 20,
                    nameRotate: 0,
                    // max: getMax(yAxisIndexZeroArr),
                    // min: getMin(yAxisIndexZeroArr),
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
                        // formatter: item.yFormatter || (value => value.toFixed(item.yAccuracy ?? 0)),
                    },
                    nameTextStyle: { color: '#fff' }
                },
                {
                    show: item.showYAxis1 ?? true,
                    name: item.yName1 ?? '元',
                    type: item.yType1 ?? "value",
                    nameGap: item.yNameGapOne ?? 20,
                    nameRotate: 0,
                    // max: getMax(yAxisIndexOneArr),
                    // min: getMin(yAxisIndexOneArr),
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
                        // formatter: item.yFormatter1 || (value => value.toFixed(item.yAccuracy1 ?? 0)),

                    },
                    nameTextStyle: { color: '#fff' }
                },
            ],
            series: item.data
        }), true)
    } else {// 单轴
        myChart.setOption(getCommonOption(item, {
            yAxis: item.yAxis ?? [
                {
                    show: item.showYAxis ?? true,
                    name: item.yName ?? 'MW',
                    type: item.yType ?? "value",
                    nameGap: item.yNameGap ?? 20,
                    nameRotate: 0,
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
                        formatter: item.yFormatter || (value => value.toFixed(item.yAccuracy ?? 0)),
                    },
                    nameTextStyle: { color: item.yUnitColor ?? '#fff' }
                },
            ],
            series: item.data
        }), true)
    }
    myChart.on('legendselectchanged', (params) => {
        if (item?.doubleY) {
            updateChartAndCalculateMax(item, params as LegendSelectChangedEvent, myChart!);
        }
    });
      window.removeEventListener("resize", resizeHandler)
  window.addEventListener("resize", resizeHandler)
  
  // 初始化后立即调用一次 resize 确保尺寸正确
  setTimeout(() => {
    resizeHandler()
  }, 100)
}
const updateChartAndCalculateMax = (item: ChartOptions, name: LegendSelectChangedEvent, myChart: eCharts.ECharts) => {
    let filteredData = item.data;
    if (name) {
        const currentSelected = Object.keys(name.selected).filter(key => name.selected[key]);
        filteredData = item.data?.filter(dataItem => currentSelected.includes(dataItem.name));
    }
    myChart.setOption({
        series: filteredData
    });
    calculateMax({ ...item, data: filteredData }, myChart);
};
//计算y轴上下限
const calculateMax = (item: ChartOptions, myChart: eCharts.ECharts) => {
    let yAxisIndexZeroArr: Array<number | null> = []
    let yAxisIndexOneArr: Array<number | null> = []

    // // 计算所有数据的最大值和最小值
    // item.data?.map(seriesData => {
    //   if (seriesData.yAxisIndex == 0) {
    //     yAxisIndexZeroArr.push(...seriesData.data);
    //   } else if (seriesData.yAxisIndex == 1) {
    //     yAxisIndexOneArr.push(...seriesData.data);
    //   }
    // });
    // const yAxisIndexZeroArr = item.data?.filter(d => d.yAxisIndex === 0).flatMap(d => d.data) || [];
    // const yAxisIndexOneArr = item.data?.filter(d => d.yAxisIndex === 1).flatMap(d => d.data) || [];
    item.data?.forEach(seriesData => {
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
// 生成表格数据
const calculateTableData = (item: ChartOptions, tableHeader: any, tableData: any) => {
    // 初始化表头
    tableHeader.value = [{
        title: item.title || '时间',
        key: 'timeList',
    }]

    // 初始化表体 
    tableData.value = item.timeList?.map(time => ({ timeList: time })) || []

    // 遍历数据，生成表头和表体
    item.data?.forEach(({ name, tableUnit, data }) => {
        const updatedName = tableUnit ? `${name}${tableUnit}` : name
        tableHeader.value.push({
            title: updatedName,
            key: name,
        })
        data.forEach((val, idx) => {
            if (tableData.value[idx]) {
                tableData.value[idx][name] = val
            }
        })
    })

    // 删除首尾点
    if (item.deleteLastPoint) {
        tableData.value.pop()
    } else if (item.deleteFirstPoint) {
        tableData.value.shift()
    }
}
// 添加组件内部的 ResizeObserver
let containerResizeObserver: ResizeObserver | null = null
defineExpose({ resizeHandler })//暴露方法,在父组件中调用

onMounted(() => {
      if(opt.value.compensateType){
    judgeCompensateType()
  }else{
    initStationRef(opt.value)
  }
    if ((props.opt as any).showTable !== undefined) {
        showTable.value = (props.opt as any).showTable
        if (showTable.value) {
            calculateTableData(opt.value, eChartsTableHeader, eChartsTableData)
        }
    }
      // 监听图表容器本身的尺寸变化
  nextTick(() => {
    if (eChartsBoxRef.value) {
      containerResizeObserver = new ResizeObserver((entries) => {
        // 使用 requestAnimationFrame 确保在浏览器重绘前执行
        requestAnimationFrame(() => {
          const entry = entries[0]

          if (myChart && !myChart.isDisposed()) {
            myChart.resize()
          }
        })
      })
      containerResizeObserver.observe(eChartsBoxRef.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener("resize", resizeHandler)
  if (containerResizeObserver) {
    containerResizeObserver.disconnect()
    containerResizeObserver = null
  }
  disposeChart()
})
//防抖函数
const debounce = (func: Function, delay: number) => {
  let timer: number | null = null
  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
// 防抖的图表初始化函数
const debouncedInitChart = debounce((newVal: ChartOptions) => {
  if (newVal && Object.keys(newVal).length > 0) {
    showValue.value = true
    calculateTableData(newVal, eChartsTableHeader, eChartsTableData)
    initStationRef(newVal)
    
    // 图表重新初始化后，确保 resize
    nextTick(() => {
      setTimeout(() => {
        if (myChart && !myChart.isDisposed()) {
          myChart.resize()
        }
      }, 150)
    })
  }
}, 100) // 100ms 防抖延迟

watch(() => opt.value, (newVal) => {
  // 使用防抖函数避免频繁重新初始化
  showValue.value = true
  debouncedInitChart(newVal)
}, { deep: true, immediate: false }) // 添加深度监听，避免立即执行
</script>