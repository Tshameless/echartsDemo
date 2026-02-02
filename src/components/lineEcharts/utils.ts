import dayjs from 'dayjs'
import type { ChartSeriesData, ChartOptions } from './types'

/** 转义 HTML 防止 XSS（Tooltip 等来自数据的内容，统一转义后再用于 v-html） */
export function escapeHtml(s: string | number): string {
    const str = String(s)
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// y轴上下限计算函数
export const calcYAxisMax = (value: { max: number, min: number }) => {
    const maxAbs = Math.max(Math.abs(value.max), Math.abs(value.min));
    return parseFloat((maxAbs * 1.2).toFixed(2));
}

export const calcYAxisMin = (value: { max: number, min: number }, arr: Array<number | null>) => {
    const validArr = arr.filter(v => v !== null) as number[];

    if (validArr.length === 0) {
        return value.min >= 0 ? 0 : -calcYAxisMax(value);
    }
    const otherMax = Math.max(...validArr);
    const otherMin = Math.min(...validArr);
    const currentMax = calcYAxisMax(value);
    const otherAxisMax = Math.max(Math.abs(otherMax), Math.abs(otherMin)) * 1.2;

    const currentDataMin = value.min < 0 ? Math.abs(value.min) * 1.2 : 0;
    const otherDataMin = otherMin < 0 ? Math.abs(otherMin) * 1.2 : 0;

    const currentZeroRatio = currentDataMin / (currentMax + currentDataMin);
    const otherZeroRatio = otherDataMin / (otherAxisMax + otherDataMin);

    const targetZeroRatio = Math.max(currentZeroRatio, otherZeroRatio);

    if (targetZeroRatio === 0) {
        return 0;
    }

    const calculatedMin = targetZeroRatio * currentMax / (1 - targetZeroRatio);
    const result = -parseFloat(calculatedMin.toFixed(2));

    return result;
}

// 检测时间格式
export const detectTimeFormat = (timeStr: string | number): string => {
    const str = String(timeStr).trim()

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
        return 'HH:mm:ss'
    } else if (/^\d{1,2}:\d{2}$/.test(str)) {
        return 'HH:mm'
    }

    return 'HH:mm'
}

// 判断补点时间类型
export const judgeCompensateTimeType = (direction: 'start' | 'end' = 'end', timeList?: Array<string | number>): string | undefined => {
    if (!timeList || timeList.length < 2) return undefined

    let firstTime: string, secondTime: string

    if (direction === 'end') {
        firstTime = String(timeList[timeList.length - 2])
        secondTime = String(timeList[timeList.length - 1])
    } else {
        firstTime = String(timeList[0])
        secondTime = String(timeList[1])
    }

    const handleSpecialTime = (time: string): { time: string; addDay: boolean } => {
        if (time === '24:00' || time === '24:00:00') {
            return { time: time.replace('24:', '00:'), addDay: true }
        }
        return { time, addDay: false }
    }

    const firstTimeInfo = handleSpecialTime(firstTime)
    const secondTimeInfo = handleSpecialTime(secondTime)

    firstTime = firstTimeInfo.time
    secondTime = secondTimeInfo.time

    const timeFormat = detectTimeFormat(firstTime)
    const isTimeOnly = /^(\d{1,2}):(\d{2})(:\d{2})?$/.test(firstTime)

    let firstDayjs: dayjs.Dayjs, secondDayjs: dayjs.Dayjs

    if (isTimeOnly) {
        const baseDate = '2024-01-01'
        firstDayjs = dayjs(`${baseDate} ${firstTime}`, `YYYY-MM-DD ${timeFormat}`)
        secondDayjs = dayjs(`${baseDate} ${secondTime}`, `YYYY-MM-DD ${timeFormat}`)

        if (firstTimeInfo.addDay) {
            firstDayjs = firstDayjs.add(1, 'day')
        }
        if (secondTimeInfo.addDay) {
            secondDayjs = secondDayjs.add(1, 'day')
        }

        if (secondDayjs.isBefore(firstDayjs)) {
            secondDayjs = secondDayjs.add(1, 'day')
        }
    } else {
        firstDayjs = dayjs(firstTime, timeFormat)
        secondDayjs = dayjs(secondTime, timeFormat)
    }

    if (!firstDayjs.isValid() || !secondDayjs.isValid()) {
        console.error('时间解析失败:', { firstTime, secondTime, timeFormat })
        return undefined
    }

    const diffInMilliseconds = secondDayjs.diff(firstDayjs)

    let newTime: dayjs.Dayjs
    if (direction === 'end') {
        newTime = secondDayjs.add(diffInMilliseconds, 'millisecond')
    } else {
        newTime = firstDayjs.subtract(diffInMilliseconds, 'millisecond')
    }

    let resultTime = newTime.format(timeFormat)

    if (isTimeOnly && resultTime === '00:00') {
        const baseDate = dayjs('2024-01-01')
        if (newTime.date() > baseDate.date()) {
            resultTime = '24:00'
        }
    }

    return resultTime
}

// 辅助函数：计算补点值
export const calculateCompensateValue = (type: 'start' | 'end', list: Array<string | number> | undefined) => {
    if (!list || list.length < 2) return undefined

    const idx1 = type === 'end' ? list.length - 2 : 0
    const idx2 = type === 'end' ? list.length - 1 : 1

    const val1 = list[idx1]
    const val2 = list[idx2]

    // 判断是否为纯数字（排除日期格式字符串）
    const isNumeric = (val: string | number) => {
        if (typeof val === 'number') return true
        return !isNaN(Number(val)) && !/[-/:]/.test(String(val))
    }

    if (isNumeric(val1) && isNumeric(val2)) {
        const num1 = Number(val1)
        const num2 = Number(val2)
        const diff = num2 - num1
        const result = type === 'end' ? num2 + diff : num1 - diff
        // 保持原数据类型一致性
        return typeof val1 === 'string' ? String(result) : result
    }

    return judgeCompensateTimeType(type, list)
}

// 默认提示格式化器
export const defaultTooltipFormatter = (params: any[], item: ChartOptions, isDoubleY = false): string => {
    let result: string
    if (item.xName && item.xName !== '时间' && item.xName !== '日期') {
        result = `<div style="margin:2px 0 0 5px; color:#fff">${params[0].axisValue}${item.xName}</div>`
    } else {
        result = `<div style="margin:2px 0 0 5px; color:#fff">${params[0].axisValue}</div>`
    }
    result += params.map((param: any) => {
        let yUnit = ''
        if (isDoubleY) {
            const seriesItem = item.series?.find(d => d.name === param.seriesName)
            if (seriesItem) {
                yUnit = (seriesItem.yAxisIndex ?? 1) === 0 ? (item.yName?.includes('：') ? item.yName.split('：')[1] || '' : item.yName || '') : (item.yName1?.includes('：') ? item.yName1.split('：')[1] || '' : item.yName1 || '')
            }
        } else {
            yUnit = item.yName?.includes('：') ? (item.yName.split('：')[1] || '') : (item.yName || '');
        }
        return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff"><div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>${param.seriesName}：${param.value != null ? param.value : '--'}${yUnit}</div>`
    }).join('<br>')
    return result
}

// 获取Y轴数据
export const getYAxisData = (data: Array<ChartSeriesData>, yAxisIndex: number): number[] =>
    data.filter(d => d.yAxisIndex === yAxisIndex).flatMap(d => d.data.filter(v => v !== null) as number[])
