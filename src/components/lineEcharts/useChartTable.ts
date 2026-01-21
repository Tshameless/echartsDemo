import { ref, type Ref } from 'vue'
import type { ChartOptions, TableColumn } from './types'

export function useChartTable() {
    const showTable = ref(false)
    const tableData = ref<Array<Record<string, any>>>([])
    const tableHeader = ref<TableColumn[]>([])
    const showValue = ref(true)

    const calculateTableData = (item: ChartOptions) => {
        // 初始化表头
        tableHeader.value = [{
            title: item.title || '时间',
            key: 'timeList',
        }]

        // 初始化表体 
        tableData.value = item.timeList?.map(time => ({ timeList: time })) || []

        // 遍历数据，生成表头和表体
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

        // 删除首尾点
        if (item.deleteLastPoint) {
            tableData.value.pop()
        } else if (item.deleteFirstPoint) {
            tableData.value.shift()
        }
    }

    return {
        showTable,
        tableData,
        tableHeader,
        showValue,
        calculateTableData
    }
}
