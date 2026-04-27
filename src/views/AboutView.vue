<template>
  <div class="container" id="home-root">
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eChartsDataSpecial).length > 0" :opt="eChartsDataSpecial" :height="350">
      </lineECharts>
    </div>
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eChartsData2).length > 0" :opt="eChartsData2" :height="350"></lineECharts>
    </div>
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eleEchartsData).length > 0" :opt="eleEchartsData" :height="350" />
    </div>
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eChartsData).length > 0" :opt="eChartsData" :height="350"></lineECharts>
    </div>
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eChartsData3).length > 0" :opt="eChartsData3" :height="350"></lineECharts>
    </div>

    <div class="lineEChartsBox">
      <lineECharts ref="chartRef" v-if="Object.keys(eChartsData4).length > 0" :opt="eChartsData4" :height="350">
      </lineECharts>
    </div>
    <div class="lineEChartsBox">
      <lineECharts v-if="Object.keys(eChartsData5).length > 0" :opt="eChartsData5" :height="350"></lineECharts>
    </div>
    <div class="lineEChartsBox" style="border: 1px  solid red;">
      <lineECharts v-if="Object.keys(powerConsumptionOpt).length > 0" :opt="powerConsumptionOpt" class="chart-canvas"
        :height="170" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue"
import lineECharts from "../components/Echarts/index.vue"
import usePowerIcon from '../assets/img/usePowerIcon.png';
import dayjs from "dayjs"

const eChartsData = ref({})
const eChartsData2 = ref({})
const eChartsDataSpecial = ref({})
const eChartsData3 = ref({})
const eChartsData4 = ref({})
const eChartsData5 = ref({})
const eleEchartsData = ref({})
let resizeObserver = null
const powerConsumptionOpt = ref<any>({})

const chartRef = ref()

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
      showTable: true,
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
      showTable: true,
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
    const currentIndex = 12
    eChartsData3.value = {
      title: '时间',
      timeList: Array.from({ length: 24 }, (_, index) =>
        dayjs().startOf('day').add(index, 'hour').format('HH:mm')
      ),
      showTable: true,
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
      showTable: true,
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
      showTable: true,
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
      showTable: true,
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
        chartRef.value?.resizeHandler && chartRef.value.resizeHandler()
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
</style>