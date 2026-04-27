import { computed, type Ref, watch, ref } from 'vue'
import type { ChartOptions } from './types'
import { calculateCompensateValue } from './utils'

/**
 * 专门处理数据补点逻辑的 Hook
 * 优化点：通过独立的 ref 存储处理后的数据，仅在核心数据变化时重新计算
 */
export function useProcessedData(opt: Ref<ChartOptions>) {
    
    // 存储处理后的配置，避免在 computed 中进行深拷贝导致不必要的触发
    const processedOpt = ref<ChartOptions>({ ...opt.value })

    const processData = (currentOpt: ChartOptions) => {
        // 如果没有补点需求，直接返回原始配置的浅拷贝
        if (!currentOpt.compensateType || !currentOpt.timeList) {
            processedOpt.value = { ...currentOpt }
            return
        }

        // 深拷贝关键数组，避免污染原始 props
        const processed: ChartOptions = { 
            ...currentOpt,
            timeList: currentOpt.timeList ? [...currentOpt.timeList] : undefined,
            series: currentOpt.series?.map(item => ({
                ...item,
                data: [...item.data]
            }))
        }

        const { compensateType, timeList, series } = processed
        
        if (timeList && series) {
            if (compensateType === 'end') {
                const nextTime = calculateCompensateValue('end', timeList)
                if (nextTime !== undefined) {
                    timeList.push(nextTime)
                    series.forEach(item => item.data.push(null))
                }
            } else if (compensateType === 'start') {
                const previousTime = calculateCompensateValue('start', timeList)
                if (previousTime !== undefined) {
                    timeList.unshift(previousTime)
                    series.forEach(item => item.data.unshift(null))
                }
            }
        }

        processedOpt.value = processed
    }

    // 仅在核心数据或补点配置变化时重新计算
    watch(
        () => [opt.value.series, opt.value.timeList, opt.value.compensateType],
        () => processData(opt.value),
        { deep: true, immediate: true }
    )

    // 样式等其他非核心数据的同步
    watch(
        () => opt.value,
        (newVal) => {
            // 合并非核心数据的变更，不触发数据重算
            Object.assign(processedOpt.value, newVal)
        },
        { deep: false }
    )

    return {
        processedOpt
    }
}
