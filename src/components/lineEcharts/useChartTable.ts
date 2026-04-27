import { ref, watch, type Ref } from 'vue'
import type { ChartOptions, TableColumn } from './types'

export function useChartTable() {
    const showTable = ref(false)
    const tableData = ref<Array<Record<string, any>>>([])
    const tableHeader = ref<TableColumn[]>([])
    const showValue = ref(true)
    
    // 标记是否需要刷新数据（当数据变化但表格不可见时标记为 true）
    const needsRefresh = ref(false)
    let lastConfig: ChartOptions | null = null

    const calculateTableData = (item: ChartOptions, force = false) => {
        lastConfig = item
        
        // 如果表格不可见且不强制刷新，则只标记，不计算
        if (showValue.value && !force) {
            needsRefresh.value = true
            return
        }

        // 执行计算
        tableHeader.value = [{
            title: item.title || '时间',
            key: 'timeList',
        }]

        tableData.value = item.timeList?.map(time => ({ timeList: time })) || []

        item.series?.forEach(({ name, tableUnit, data }) => {
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

        if (item.deleteLastPoint) {
            tableData.value.pop()
        } else if (item.deleteFirstPoint) {
            tableData.value.shift()
        }
        
        needsRefresh.value = false
    }

    // 当切换到表格视图时，如果需要刷新则立即执行
    watch(showValue, (isChart) => {
        if (!isChart && needsRefresh.value && lastConfig) {
            calculateTableData(lastConfig, true)
        }
    })

    return {
        showTable,
        tableData,
        tableHeader,
        showValue,
        calculateTableData
    }
}
