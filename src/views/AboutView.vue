<template>
  <div class="container" id="home-root">
    <div class="lineEChartsBox">
      <LineECharts v-if="Object.keys(eChartsDataSpecial).length > 0" :opt="eChartsDataSpecial" :height="350" />
    </div>
    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eChartsData2).length > 0"
        :opt="eChartsData2"
        :height="350"
        table-mode="switch"
      >
        <template #table="{ dataTableColumns, tableRows, tableMaxHeight }">
          <el-table
            :data="buildInsertedTableRows(tableRows)"
            row-key="__rowKey"
            :max-height="tableMaxHeight"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column
              v-for="column in buildInsertedTableColumns(dataTableColumns)"
              :key="column.field"
              :label="column.label"
              :prop="column.prop"
              :fixed="column.fixed"
              :width="column.width"
              :min-width="column.minWidth"
              show-overflow-tooltip
            />
          </el-table>
        </template>
      </LineECharts>
    </div>
    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eleEchartsData).length > 0"
        :opt="eleEchartsData"
        :height="350"
        table-mode="bottom"
      />
    </div>
    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eChartsData).length > 0"
        :opt="eChartsData"
        :height="350"
        table-mode="switch"
      >
        <template #table="{ dataTableColumns, tableRows, tableMaxHeight }">
          <el-table
            :data="buildAppendedTableRows(tableRows)"
            row-key="__rowKey"
            :max-height="tableMaxHeight"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column
              v-for="column in buildAppendedTableColumns(dataTableColumns)"
              :key="column.field"
              :label="column.label"
              :prop="column.prop"
              :fixed="column.fixed"
              :width="column.width"
              :min-width="column.minWidth"
              show-overflow-tooltip
            />
          </el-table>
        </template>
      </LineECharts>
    </div>
    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eChartsData3).length > 0"
        :opt="eChartsData3"
        :height="350"
        table-mode="switch"
      >
        <template #header-left>
          <div class="table-caption">单图组件自定义表格插槽示例-只需要表头</div>
        </template>
      </LineECharts>
    </div>

    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eChartsData4).length > 0"
        ref="chartRef"
        :opt="eChartsData4"
        :height="350"
        table-mode="switch"
            >
        <template #header-right>
          <div class="table-caption">单图组件自定义表格插槽示例-只需要表头</div>
        </template>
      </LineECharts>
    </div>
    <div class="lineEChartsBox">
      <LineECharts
        v-if="Object.keys(eChartsData5).length > 0"
        :opt="eChartsData5"
        :height="350"
        table-mode="switch"
      />
    </div>
    <div class="lineEChartsBox box-highlight">
      <LineECharts v-if="Object.keys(powerConsumptionOpt).length > 0" :opt="powerConsumptionOpt" class="chart-canvas"
        :height="170" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, shallowRef } from 'vue'
import LineECharts from '../components/Echarts/index.vue'
import type { ChartTableRow, TableColumn } from '../components/Echarts/types'
import usePowerIcon from '../assets/img/usePowerIcon.png';
import dayjs from "dayjs"

const eChartsData = shallowRef({})
const eChartsData2 = shallowRef({})
const eChartsDataSpecial = shallowRef({})
const eChartsData3 = shallowRef({})
const eChartsData4 = shallowRef({})
const eChartsData5 = shallowRef({})
const eleEchartsData = shallowRef({})
let resizeObserver: ResizeObserver | null = null
const powerConsumptionOpt = shallowRef<any>({})

const chartRef = shallowRef<InstanceType<typeof LineECharts> | null>(null)
const INSERTED_FIELD = 'custom_inserted_column'
const APPENDED_FIELD = 'custom_appended_column'
const insertedColumnsCache = new WeakMap<TableColumn[], TableColumn[]>()
const insertedRowsCache = new WeakMap<ChartTableRow[], ChartTableRow[]>()
const appendedColumnsCache = new WeakMap<TableColumn[], TableColumn[]>()
const appendedRowsCache = new WeakMap<ChartTableRow[], ChartTableRow[]>()

function buildInsertedTableColumns(columns: TableColumn[]) {
  const cachedColumns = insertedColumnsCache.get(columns)
  if (cachedColumns) return cachedColumns

  const [timeColumn, ...dataColumns] = columns
  const insertedColumn: TableColumn = {
    label: 'E',
    field: INSERTED_FIELD,
    prop: INSERTED_FIELD,
    minWidth: 140,
  }

  const nextColumns =
    !timeColumn
      ? [insertedColumn]
      : dataColumns.length === 0
        ? [timeColumn, insertedColumn]
        : [timeColumn, insertedColumn, ...dataColumns]

  insertedColumnsCache.set(columns, nextColumns)
  return nextColumns
}

function buildInsertedTableRows(rows: ChartTableRow[]) {
  const cachedRows = insertedRowsCache.get(rows)
  if (cachedRows) return cachedRows

  const nextRows = rows.map((row, index) => ({
    ...row,
    [INSERTED_FIELD]: `e-${index + 1}`,
  }))

  insertedRowsCache.set(rows, nextRows)
  return nextRows
}

function buildAppendedTableColumns(columns: TableColumn[]) {
  const cachedColumns = appendedColumnsCache.get(columns)
  if (cachedColumns) return cachedColumns

  const appendedColumn: TableColumn = {
    label: 'D',
    field: APPENDED_FIELD,
    prop: APPENDED_FIELD,
    minWidth: 140,
  }

  const nextColumns = [...columns, appendedColumn]
  appendedColumnsCache.set(columns, nextColumns)
  return nextColumns
}

function buildAppendedTableRows(rows: ChartTableRow[]) {
  const cachedRows = appendedRowsCache.get(rows)
  if (cachedRows) return cachedRows

  const nextRows = rows.map((row, index) => ({
    ...row,
    [APPENDED_FIELD]: `d-${index + 1}`,
  }))

  appendedRowsCache.set(rows, nextRows)
  return nextRows
}

const getDonutOption = (colors: string[], data: any[], icon: any, unit: string = '(kWh)') => {
  const total = data[0].value;
  const part = data[1].value;
  const name1 = data[0].name;
  const name2 = data[1].name;
  const mainColor = colors[0];
  const subColor = colors[1];
  return {
    color: colors,
    legend: {
      show: true, top: 'center', right: '0%',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      textStyle: {
        color: '#fff',
        fontSize: 12,
        rich: {
          name: {
            color: '#70757f',
            width: 120,
            fontSize: '14px',
          },
          value: {
            color: '#272f3b',
            width: 40,
            fontSize: '20px',
            fontWeight: '700',
          },
          unit: {
            color: '#272f3b',
            width: 40,
            fontSize: '12px',
            fontWeight: '400',
          }
        }
      },
      formatter: (name: string) => {
        if (!name) return '';
        const item = data.find(v => v.name === name);
        const val = item ? item.value : '';
        return `{name|${name}}{value|${val}}{unit|${unit}}`;
      }
    },
    tooltip: {
      show: true,
      trigger: 'item',
    },
    xAxis: [],
    yAxis: [],
    dataZoom: [],
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['54%', '70%'],
        center: ['30%', '50%'],
        silent: false,
        label: { show: false },
        startAngle: 180,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10
        },
        data: [
          {
            value: part,
            name: name2,
            itemStyle: {
              color: subColor
            },
            tableUnit: unit
          },
          {
            value: total - part,
            name: '',
            itemStyle: { color: 'transparent' },
            tooltip: { show: false }
          }
        ]
      },
      {
        name: '',
        type: 'pie',
        radius: ['72%', '88%'],
        center: ['30%', '50%'],
        label: { show: false },
        startAngle: 90,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10
        },
        data: [
          {
            value: total,
            name: name1,
            itemStyle: {
              color: mainColor,
              opacity: 0.9
            },
            tableUnit: unit
          }
        ]
      }
    ],
    graphic: [
      {
        type: 'image',
        left: '28%',
        top: 'center',
        style: {
          image: icon,
          width: 32,
          height: 32
        }
      }
    ]
  }
}

onMounted(() => {
  nextTick(() => {
    // 热力图配置
    eChartsDataSpecial.value = {
      title: {
        text: '1月份热力图',
        left: 'center'
      },
      tooltip: {
        position: 'top'
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '20%'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 31 }, (_, i) => `${i + 1}日`),
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return `${hour}:00`;
        }),
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        show: false
      },
      series: [{
        name: '热力值',
        type: 'heatmap',
        data: Array.from({ length: 31 }, (_, day) =>
          Array.from({ length: 24 }, (_, hour) => [
            day,
            hour,
            Math.floor(Math.random() * 100)
          ])
        ).flat(),
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    // 修复：确保 timeList 和 data 长度一致
    eChartsData.value = {
      title: '时间',
      timeList: Array.from({ length: 3000 }, (_, i) => i + 1),
      legendLocation: 'center',
      boundaryGap: true,
      dataZoomShow: true,
      xName: '',
      xNameGap: 15,
      deleteLastPoint: true,
      grid: {
        left: '3%',
        right: '8%',
        bottom: '12%',
        containLabel: true
      },
      yName: 'MW',
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          tableUnit: '(MW)',
          data: Array.from({ length: 3000 }, (_, i) => i + 1)
        },
        {
          name: "实时负荷",
          type: "bar",
          barWidth: "10",
          tableUnit: '(MW)',
          data: Array.from({ length: 3000 }, (_, i) => i + 1)
        },
      ]
    }

    // 双 Y 轴配置
    eChartsData2.value = {
      title: '时间',
      timeList: Array.from({ length: 24 }, (_, n) => n),
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xName: '时间',
      deleteFirstPoint: true,
      compensateType: 'end',
      yName: 'MW',
      yName1: '元/MWh',
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          tableUnit: '(MW)',
          data: Array.from({ length: 24 }, (_, n) => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-1)
            } else {
              return n * 10
            }
          }),
          yAxisIndex: 0
        },
        {
          name: "实时负荷",
          type: "line",
          tableUnit: '(元/MWh)',
          step: "end",
          data: Array.from({ length: 24 }, (_, n) => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-2)
            } else {
              return n * 10
            }
          }),
          yAxisIndex: 1
        },
      ]
    }

    // 修复：xAlignValue 应该是布尔值，visualMap 配置优化
    const currentIndex: number = 12
    eChartsData3.value = {
      title: '时间',
      timeList: Array.from({ length: 24 }, (_, index) =>
        dayjs().startOf('day').add(index, 'hour').format('HH:mm')
      ),
      legendLocation: 'center',
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xAlignValue: true,
      xName: '时间',
      compensateType: 'end',
      yName: 'MW',
      yName1: '元/MWh',
      visualMap: currentIndex !== -1 ? [
        {
          show: false,
          dimension: 0,
          seriesIndex: 0,
          pieces: [
            {
              lte: currentIndex,
              color: 'red'
            },
            {
              gt: currentIndex,
              lte: 1500,
              color: 'gray'
            }
          ]
        },
        {
          show: false,
          dimension: 0,
          seriesIndex: 1,
          pieces: [
            {
              lte: currentIndex,
              color: 'yellow'
            },
            {
              gt: currentIndex,
              lte: 1500,
              color: 'gray'
            }
          ]
        }
      ] : [],
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          symbol: 'none',
          tableUnit: '(MW)',
          data: Array.from({ length: 24 }, (_, n) => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * 1.2
            } else {
              return n * 5
            }
          }),
          yAxisIndex: 0
        },
        {
          name: "实时负荷",
          type: "line",
          step: 'end',
          tableUnit: '(元/MWh)',
          data: Array.from({ length: 24 }, (_, n) => n + 1).map(n => {
            return n * 5
          }),
          yAxisIndex: 1
        },
      ]
    }

    // 修复：分类数据与数值数据长度不匹配的问题
    eChartsData4.value = {
      title: '设备状态分布',
      timeList: ['运行', '离线', '故障', '报警', '无信息'],
      legendLocation: 'center',
      boundaryGap: true,
      dataZoomShow: false,
      xName: '状态',
      deleteLastPoint: false,
      xAlignValue: false,
      doubleY: true,
      yName: '数量',
      yName1: '百分比',
      tooltipFormatter: function (params: any) {
        return params.map((param: any) => {
          const safeName = String(param.axisValueLabel).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const safeValue = param.data != null ? String(param.data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--'
          const unit = param.componentIndex == 0 ? '个' : '%'
          return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff">
                    <div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>
                    ${safeName}：${safeValue}${unit}
                  </div>`;
        }).join('<br>');
      },
      series: [
        {
          name: "设备数量",
          type: "bar",
          tableUnit: '(个)',
          data: [15, 3, 2, 5, 1],
          yAxisIndex: 0
        },
        {
          name: "占比",
          type: "line",
          symbol: 'circle',
          tableUnit: '(%)',
          data: [57.7, 11.5, 7.7, 19.2, 3.8],
          yAxisIndex: 1
        },
      ]
    }

    eChartsData5.value = {
      title: '告警趋势',
      timeList: ['运行', '离线', '故障', '报警', '无信息'],
      legendLocation: 'center',
      boundaryGap: true,
      dataZoomShow: false,
      xName: '状态',
      deleteLastPoint: false,
      xAlignValue: false,
      doubleY: true,
      yName: '计数',
      yName1: '比率',
      tooltipFormatter: function (params: any) {
        return params.map((param: any) => {
          const safeName = String(param.axisValueLabel).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          const safeValue = param.data != null ? String(param.data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '--'
          const unit = param.componentIndex == 0 ? '次' : '‰'
          return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff">
                    <div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>
                    ${safeName}：${safeValue}${unit}
                  </div>`;
        }).join('<br>');
      },
      series: [
        {
          name: "发生次数",
          type: "bar",
          tableUnit: '(次)',
          barWidth: '10px',
          data: [120, 8, 5, 25, 3],
          yAxisIndex: 0
        },
        {
          name: "发生率",
          type: "line",
          symbol: 'diamond',
          tableUnit: '(‰)',
          data: [4.6, 0.3, 0.2, 1.0, 0.1],
          yAxisIndex: 1
        },
      ]
    }

    // SOC 和功率监控
    eleEchartsData.value = {
      title: '储能系统监控',
      doubleY: true,
      legendLocation: 'center',
      legendTop: '5%',
      timeList: Array.from({ length: 50 }, (_, i: number) => i + 1),
      dataZoomShow: true,
      xName: '时间点',
      yName: '功率(kW)',
      yName1: 'SOC(%)',
      xAlignValue: true,
      series: [
        {
          name: '运行功率',
          data: Array.from({ length: 50 }, (_, i) => Number((Math.random() * 2000 - 1200).toFixed(0))),
          tableUnit: '(kW)',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          rawData:[1,2,3,4,5,6] //自定义单列表格数据
        },
        {
          name: 'SOC',
          data: Array.from({ length: 50 }, (_, i) => Number((Math.random() * 100).toFixed(0))),
          tableUnit: '(%)',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
        }
      ]
    }
  })

  nextTick(() => {
    const mainContent = document.getElementById('home-root')
    if (mainContent) {
      resizeObserver = new window.ResizeObserver(() => {
        chartRef.value?.resizeHandler?.()
      })
      resizeObserver.observe(mainContent)
    }
  })

  powerConsumptionOpt.value = getDonutOption(
    ['#5A7FFF', '#42C090'],
    [
      { value: 100, name: '电网供电量：' },
      { value: 35, name: '光伏发电量：' }
    ],
    usePowerIcon
  )
})
</script>
<style>
.container {
  width: 100%;
  height: 100dvh;
  background-color: #666;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
}

.lineEChartsBox {
  width: 50%;
}

.box-highlight {
  border: 1px solid red;
}

</style>
