<template>
  <div class="container" id="home-root">

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
      <lineECharts  ref="chartRef" v-if="Object.keys(eChartsData4).length > 0" :opt="eChartsData4" :height="350"></lineECharts>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue"
import lineECharts from "../components/lineEcharts.vue"

const eChartsData = ref({})
const eChartsData2 = ref({})
const eChartsData3 = ref({})
const eChartsData4 = ref({})
const eleEchartsData = ref({})
let resizeObserver = null
const chartRef=ref()
onMounted(() => {
  nextTick(() => {
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
      data: [
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
      timeList: Array.from(Array(25).keys()).map(n => n),
      showTable: true,
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xName: '时间',
      deleteFirstPoint: true,
      yName: 'MW',
      yName1: '元/MWh',
      data: [
        {
          name: "负荷设备功率",
          type: "line",
          step: "start",
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
      timeList: Array.from(Array(24).keys()).map(n => n + 1),
      showTable: true,
      legendLocation: 'center',
      boundaryGap: true,
      doubleY: true,
      dataZoomShow: true,
      xAlignValue: 'center',
      xName: '时间',
      deleteLastPoint: true,
      yName: 'MW',
      yName1: '元/MWh',
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
      data: [
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
          tableUnit: '(元/MWh)',
          data: Array.from(Array(24).keys()).map(n => n + 1).map(n => {
            if (n % 2 == 0) {
              return n * (-3)
            } else {
              return n * 10
            }
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
      data: [
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
              return n * 10
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
              return n * 8
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
      data: [
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
