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
import lineECharts from "../components/lineEcharts/index.vue"
// 导入中心图标图片资源
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
const getDonutOption = (colors: string[], data: any[], icon: any) => {
  const total = data[0].value;
  const part = data[1].value;
  const mainColor = colors[0];
  const subColor = colors[1];
  return {
    color: colors,
    legend: {
      show: true, top: 'center', right: '0%',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: {
        color: '#fff',
        fontSize: 12,
        rich: {
          name: {
            color: '#fff',
            width: 60,
          },
          value: {
            color: '#fff',
            width: 40,
            align: 'right'
          }
        }
      },
      formatter: (name: string) => {
        const val = name === '总额' ? total : (name === '占比' ? part : '');
        return `{name|${name}}{value|${val}}`;
      }
    },
    tooltip: {
      show: true,
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesName === 'Outer') {
          return `总额: ${params.value}`;
        }
        if (params.name === 'Part') {
          return `占比: ${params.value}`;
        }
        return null;
      }
    },
    xAxis: [],
    yAxis: [],
    dataZoom: [],
    series: [
      // 内层：占比部分 (b)
      {
        name: 'Inner',
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
            name: '占比',
            itemStyle: {
              color: subColor
            }
          },
          {
            value: total - part,
            name: '',
            itemStyle: { color: 'transparent' },
            tooltip: { show: false }
          }
        ]
      },
      // 外层：总量部分 (a)
      {
        name: 'Outer',
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
            name: '总额',
            itemStyle: {
              color: mainColor,
              opacity: 0.9
            }
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
          // 使用传入的 icon 资源（即 usePowerIcon）
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
    // 修改 eChartsDataSpecial 为热力图配置
    eChartsDataSpecial.value = {
      title: {
        text: '1月份热力图',
        left: 'center'
      },
      tooltip: {
        position: 'top'
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
            Math.floor(Math.random() * 100) // 随机生成0-100的热力值
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
    eChartsData.value = {
      title: '时间',
      // timeList: Array.from(Array(25).keys()).map(n => n),
      timeList: [1, 2, 3],
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
          // data: Array.from(Array(24).keys()).map(n => n + 1).map(n => n * 10),
          data: [1, 2, 3]

        },
        {
          name: "实时负荷",
          type: "bar",
          barWidth: "10",
          tableUnit: '(MW)',
          // data: Array.from(Array(24).keys()).map(n => n + 1).map(n => n * 7),
          data: []

        },
      ]
    }
    eChartsData2.value = {
      title: '时间',
      timeList: Array.from(Array(24).keys()).map(n => n),
      showTable: true,
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xName: '时间',
      deleteFirstPoint: true,
      yName: 'MW',
      yName1: '元/MWh',
      compensateType: 'end',
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          // symbol: 'none',//为什么和这个有关
          tableUnit: '(MW)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
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
          barWidth: "10",
          tableUnit: '(元/MWh)',
          step: "end",
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
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
    const currentIndex = ref(12)
    eChartsData3.value = {
      title: '时间',
      // timeList: Array.from(Array(24).keys()).map(n => dayjs().add(n, 'hours').format('HH:mm')),
      timeList: Array.from({ length: 24 }, (_, index) =>
        dayjs().startOf('day').add(index, 'hour').format('HH:mm')
      ),
      showTable: true,
      legendLocation: 'center',
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xAlignValue: 'center',
      xName: '时间',
      // deleteLastPoint: true,
      yName: 'MW',
      yName1: '元/MWh',
      compensateType: 'end',
      visualMap: currentIndex.value != -1 ? [
        {
          show: false,
          dimension: 0,
          seriesIndex: 0,
          pieces: [
            {
              lte: currentIndex.value,
              color: 'red'
            },
            {
              gt: currentIndex.value,
              lte: 1500,
              color: 'gray'
            }
          ]
        },
        {
          show: false,
          dimension: 0,//列索引
          seriesIndex: 1,
          pieces: [
            {
              lte: currentIndex.value,
              color: 'yellow'
            },
            {
              gt: currentIndex.value,
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
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (1.2)
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
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            return n * 5
          }),
          yAxisIndex: 1
        },
      ]
    }
    eChartsData4.value = {
      title: '时间',
      timeList: ['运行', '离线', '故障', '报警', '无信息'],
      showTable: true,
      legendLocation: 'center',
      boundaryGap: true,
      dataZoomShow: true,
      xName: '时间',
      deleteLastPoint: true,
      xAlignValue: 'center',
      doubleY: true,
      yName: '把',
      yName1: '元/MWh',
      tooltipFormatter: function (params: any) {
        return params.map((param: any) => {
          return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff">
                    <div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>
                    ${param.axisValueLabel}：${param.data != null ? param.data : '--'}${param.componentIndex == 0 ? '把' : '元/MWh'}
                  </div>`;
        }).join('<br>');
      },
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          symbol: 'none',
          tableUnit: '(MW)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-1)
            } else {
              return n * -2
            }
          }),
          yAxisIndex: 0
        },
        {
          name: "设备状态",
          type: "line",
          step: "end",
          symbol: 'none',
          tableUnit: '(MW)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-2)
            } else {
              return n * 2
            }
          }),
          yAxisIndex: 1
        },
      ]
    }
    eChartsData5.value = {
      title: '时间',
      timeList: ['运行', '离线', '故障', '报警', '无信息'],
      showTable: true,
      legendLocation: 'center',
      boundaryGap: true,
      dataZoomShow: true,
      xName: '时间',
      deleteLastPoint: true,
      xAlignValue: 'center',
      doubleY: true,
      yName: '把',
      yName1: '元/MWh',
      tooltipFormatter: function (params: any) {
        return params.map((param: any) => {
          return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff">
                    <div style="display:inline-block;width:10px;height:10px;margin-right:10px;border-radius:50%;background-color:${param.color}"></div>
                    ${param.axisValueLabel}：${param.data != null ? param.data : '--'}${param.componentIndex == 0 ? '把' : '元/MWh'}
                  </div>`;
        }).join('<br>');
      },
      series: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "end",
          symbol: 'none',
          tableUnit: '(MW)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-1)
            } else {
              return n * -2
            }
          }),
          yAxisIndex: 0
        },
        {
          name: "设备状态",
          type: "line",
          step: "end",
          symbol: 'none',
          tableUnit: '(MW)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-0.2)
            } else {
              return n * 0.1
            }
          }),
          yAxisIndex: 1
        },
      ]
    }
    eleEchartsData.value = {
      showTable: true,
      title: '时间',
      doubleY: true,
      legendLocation: 'center',
      legendTop: '5%',
      timeList: Array.from({ length: 50 }, (_, i: number) => i + 1) || [],
      dataZoomShow: true,
      xName: '时间',
      yName: 'kW',
      yName1: '%',
      xAlignValue: true,
      series: [
        {
          name: '运行功率',
          data: Array.from({ length: 50 }, (_, i) => (Math.random() * 2000 - 1200).toFixed(0)),
          tableUnit: '(kW)',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
        },
        {
          name: 'SOC',
          data: Array.from({ length: 50 }, (_, i) => ((Math.random() * 100)).toFixed(0)),
          tableUnit: '(MWh)',
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
  // 初始化用电量环形图，传入图标资源
  powerConsumptionOpt.value = getDonutOption(['#5A7FFF', '#42C090'], [{ value: 100 }, { value: 50 }], usePowerIcon)
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
