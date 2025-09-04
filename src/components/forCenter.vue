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
            <div v-show="showValue" ref="eChartsBoxRef" style="width: 95%;margin: 50px auto;"
                :style="{ height: `${height}px` }" :max-height="`${height}px`"></div>
            <n-data-table v-show="!showValue" style="width: 95%;margin: 50px auto;" :single-line="false"
                :columns="eChartsTableHeader" :data="eChartsTableData" :max-height="height - 49" striped />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { toRefs, onMounted, nextTick, watch, ref } from "vue";

import * as echarts from 'echarts';
// 定义颜色常量
const itemColorArr = ['#C1C9FF', '#6677E6', '#46B3E7', '#3379D5', '#6ECDB9', '#999999', '#E5E19A', '#EEEEEE']
const props = defineProps({
    opt: {
        type: Object,
        default: () => ({})
    },
    height: {
        type: Number,
        default: '400'
    },
    yAxisDecimalPlaces: {
        type: Number,
        default: 1
    }
})
interface TableColumn {
    title: string;
    key: string;
}
const eChartsTableHeader = ref<TableColumn[]>([])
let y0Max, y1Max, y0Min, y1Min
const { opt } = toRefs(props)
const height = ref(props.height)
const eChartsBoxRef = ref<HTMLDivElement>()
const showTable = ref(false)//默认不展示图表和图形的切换button
let stationreftableData = ref([])
const eChartsTableData: any = ref([])
let showValue = ref(true);
let yAxisIndexZeroArr = []
let yAxisIndexOneArr = []
const initStationRef = (item) => {
    let myChart = echarts.init(eChartsBoxRef.value as HTMLDivElement);
    if (item?.doubleY) {//如果有双Y轴，则初始化双Y轴
        //      item.data.map(item=>{
        //   if(item.yAxisIndex==0){
        //     yAxisIndexZeroArr.push(...item.data)
        //   }else if(item.yAxisIndex==1){
        //     yAxisIndexOneArr.push(...item.data)
        //   }
        // });

        myChart.setOption({
            tooltip: {
                show: item.tooltip ? item.tooltip : true,//默认显示tooltip
                trigger: item.tooltipTrigger ? item.tooltipTrigger : 'axis',//tooltip触发方式,默认axis
                backgroundColor: item.tooltipBackgroundColor ? item.tooltipBackgroundColor : "rgba(0,0,0,.3)",
                borderColor: item.tooltipBorderColor ? item.tooltipBorderColor : "rgba(0,0,0,.3)",
                textStyle: {
                    color: item.tooltipColor ? item.tooltipColor : "rgba(255, 255, 255, 1)",
                },
                formatter: item.tooltipFormatter ? item.tooltipFormatter : function (params) {
                    let result
                    if (item.xname != '时间' && item.xname != '日期') {
                        result = `<div style="margin:2px 0 0 5px;  color:#fff">${params[0].axisValue}${item.xname}</div>`;
                    } else {
                        result = `<div style="margin:2px 0 0 5px;  color:#fff">${params[0].axisValue}</div>`;
                    }
                    let yUnit
                    result += params.map(param => {
                        item.data.map(itemData => {
                            if (itemData.name == param.seriesName) {
                                if (itemData.yAxisIndex == 0) {
                                    if (item.yname.includes('：')) {
                                        yUnit = `${item.yname.split('：')[1]}`
                                    } else {
                                        yUnit = item.yname
                                    }
                                } else if (itemData.yAxisIndex == 1) {
                                    if (item.yname1.includes('：')) {
                                        yUnit = `${item.yname1.split('：')[1]}`
                                    } else {
                                        yUnit = item.yname1
                                    }
                                }
                            }
                        })

                        return `<div style="display:inline-block;margin:2px 0 0 5px;  color:#fff">${param.seriesName}：${param.value != null ? param.value : '--'}${yUnit}</div>`;
                    }).join('<br>');

                    return result;
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                show: item.legend ? item.legend : true,//默认显示图例
                left: item.legendLocation ? item.legendLocation : 'right',//图例位置默认右侧
                top: item.legendTop ? item.legendTop : 'top',//图例位置默认顶部
                orient: item.legendOrient ? item.legendOrient : 'horizontal',//图例排列方式默认水平
                itemWidth: item.legendItemWidth ? item.legendItemWidth : 30,//图例项宽度默认30
                itemHeight: item.legendItemHeight ? item.legendItemHeight : 14,//图例项高度默认14
                textStyle: {
                    // color: base.ECHART_COLOR, 
                    color: '#eee',
                    fontSize: 12
                },

            },
            color: itemColorArr,
            dataZoom: item.dataZoom ? item.dataZoom : [ //默认dataZoom效果生效，但是不展示，需要在父组件传参中设置dataZoomShow为true,如果不需要dataZoom效果，则设置dataZoom为[]
                {
                    show: item.dataZoomShow ? item.dataZoomShow : false,//默认不显示dataZoom放大条
                    realtime: true,
                    start: 0,
                    end: 100,
                    bottom: item.dataZoomBottom1 ? item.dataZoomBottom1 : '0%',
                    height: item.dataZoomHeight ? item.dataZoomHeight : 20,//设置dataZoom高度,默认20px
                },
                {
                    type: "inside",
                    realtime: true,
                    start: 0,
                    end: 100,
                    bottom: item.dataZoomBottom2 ? item.dataZoomBottom2 : '0%',
                },
            ],
            grid: item.grid ? item.grid : {
                left: '3%',
                right: '5%',
                bottom: '6%',
                containLabel: true
            },
            xAxis: item.xAxis ? item.xAxis : [
                {
                    show: item.showXaxis ? item.showXaxis : true,//默认显示x轴
                    name: item.xname ? item.xname : '',//当没有在opt中传xname的时候，默认显示时间
                    type: item.xtype ? item.xtype : 'category',
                    boundaryGap: item.boundaryGap ? item.boundaryGap : false,//默认不显示边界间隙
                    data: item.timeList,
                    axisLabel: {
                        color: item.xcolor ? item.xcolor : "#fff",
                        fontSize: item.xfontSize ? item.xfontSize : "12px",
                        fontWeight: item.xfontWeight ? item.xfontWeight : "normal",
                    },
                    nameTextStyle: {
                        color: '#fff',
                        verticalAlign: 'top',
                        padding: [8, 0, 0, 0],
                        fontSize: item.xNameFontSize ? item.xNameFontSize : "12px"
                    },
                }
            ],
            yAxis: [
                {
                    show: item.showYaxis ? item.showYaxis : true,//默认显示y轴
                    name: item.yname ? item.yname : 'MW',//当没有在opt中传yname的时候，默认显示MW
                    type: item.ytype ? item.ytype : "value",//默认显示值轴,
                    nameGap: item.yNameGap ? item.yNameGap : 20,
                    nameRotate: 0,
                    // max:Math.max(...yAxisIndexZeroArr)>0?Math.max(...yAxisIndexZeroArr).toFixed(0):100,
                    // max: (Math.max(...yAxisIndexZeroArr) > 1)? Math.max(...yAxisIndexZeroArr).toFixed(0) : Math.max(...yAxisIndexZeroArr).toFixed(2),
                    // min:Math.min(...yAxisIndexZeroArr)>0?0:Math.min(...yAxisIndexZeroArr).toFixed(0)||0,
                    // max:(y0Max*1.5).toFixed(0),
                    // min:(y0Min*1.5).toFixed(0),
                    // max: function (value) {
                    //     if (Math.abs(value.max) > Math.abs(value.min)) {
                    //         return Math.min(10000, Math.round(Math.abs(value.max) * 1.2));
                    //     } else {
                    //         return Math.min(10000, Math.round(Math.abs(value.min) * 1.2));
                    //     }
                    // },
                    // min: function (value) {
                    //     if (Math.abs(value.max) > Math.abs(value.min)) {
                    //         return Math.max(-10000, -Math.round(Math.abs(value.max) * 1.2));
                    //     } else {
                    //         return Math.max(-10000, -Math.round(Math.abs(value.min) * 1.2));
                    //     }
                    // },

                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            width: 1,
                            color: 'rgba(223, 223, 223, 0.1)',
                            opacity: '1',
                        }
                    },
                    axisLabel: {
                        color: '#fff',
                        formatter: function (value) {
                            return value.toFixed(props.yAxisDecimalPlaces);
                        }
                    },
                    nameTextStyle: {
                        color: '#fff',
                        fontSize: item.yNameFontSize ? item.yNameFontSize : "12px"
                    },
                },
                {
                    show: item.showYaxis1 ? item.showYaxis1 : true,//默认不显示y轴
                    name: item.yname1 ? item.yname1 : '元',//当没有在opt中传yname1的时候，默认显示元
                    type: item.ytype1 ? item.ytype1 : "value",//默认显示值轴
                    nameGap: item.yNameGapOne ? item.yNameGapOne : 20,
                    nameRotate: 0,
                    // max:Math.max(...yAxisIndexOneArr)>0?Math.max(...yAxisIndexOneArr).toFixed(0):100,
                    // max: (Math.max(...yAxisIndexOneArr) > 1)? Math.max(...yAxisIndexOneArr).toFixed(0) : Math.max(...yAxisIndexOneArr).toFixed(2),
                    // min:Math.min(...yAxisIndexOneArr)>0?0:Math.min(...yAxisIndexOneArr).toFixed(0)||0,
                    // max:(y1Max*1.5).toFixed(0),
                    // min:(y1Min*1.5).toFixed(0),
                    // max: function (value) {
                    //     if (Math.abs(value.max) > Math.abs(value.min)) {
                    //         return Math.min(10000, Math.round(Math.abs(value.max) * 1.2));
                    //     } else {
                    //         return Math.min(10000, Math.round(Math.abs(value.min) * 1.2));
                    //     }
                    // },
                    // min: function (value) {
                    //     if (Math.abs(value.max) > Math.abs(value.min)) {
                    //         return Math.max(-10000, -Math.round(Math.abs(value.max) * 1.2));
                    //     } else {
                    //         return Math.max(-10000, -Math.round(Math.abs(value.min) * 1.2));
                    //     }
                    // },

                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            width: 1,
                            color: 'rgba(223, 223, 223, 0.1)',
                            opacity: '1',
                        }
                    },
                    axisLabel: {
                        color: '#fff',
                        formatter: function (value) {
                            return value.toFixed(props.yAxisDecimalPlaces);
                        }
                    },
                    nameTextStyle: {
                        color: '#fff',
                        fontSize: item.yNameFontSize ? item.yNameFontSize : "12px"

                    },

                },
            ],
            series: item.data
        }, true)
        calculateMax(item, '', myChart);

    } else {//默认单Y轴
        let yAxisIndexArr = []
        item.data.map(item => {
            if (item.stack) {
                item.data.forEach((dataItem, index) => {
                    yAxisIndexArr[index] = yAxisIndexArr[index] ? yAxisIndexArr[index] + dataItem : dataItem;
                });
            } else {
                yAxisIndexArr.push(...item.data);
            }
            // yAxisIndexArr.push(...item.data)
        });
        myChart.setOption({
            tooltip: {
                show: item.tooltip ? item.tooltip : true,//默认显示tooltip
                trigger: item.tooltipTrigger ? item.tooltipTrigger : 'axis',//tooltip触发方式,默认axis
                backgroundColor: item.tooltipBackgroundColor ? item.tooltipBackgroundColor : "rgba(0,0,0,.3)",
                borderColor: item.tooltipBorderColor ? item.tooltipBorderColor : "rgba(0,0,0,.3)",
                textStyle: {
                    color: item.tooltipColor ? item.tooltipColor : "rgba(255, 255, 255, 1)",
                },
                formatter: item.tooltipFormatter ? item.tooltipFormatter : function (params) {
                    let result
                    if (item.xname != '时间') {
                        result = `<div style="margin:2px 0 0 5px;">${params[0].axisValue}${item.xname}</div>`;
                    } else {
                        result = `<div style="margin:2px 0 0 5px;">${params[0].axisValue}</div>`;
                    }
                    let yUnit
                    if (item.yname.includes('：')) {
                        yUnit = `${item.yname.split('：')[1]}`
                    } else {
                        yUnit = item.yname
                    }
                    result += params.map(param => {
                        return `<div style="display:inline-block;margin:2px 0 0 5px;color:#fff">${param.seriesName}：${param.value != null ? param.value : '--'}${yUnit}</div>`;
                    }).join('<br>');

                    return result;
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                show: item.legend ? item.legend : true,//默认显示图例
                left: item.legendLocation ? item.legendLocation : 'right',//图例位置默认右侧
                top: item.legendTop ? item.legendTop : 'top',//图例位置默认顶部
                orient: item.legendOrient ? item.legendOrient : 'horizontal',//图例排列方式默认水平
                itemWidth: item.legendItemWidth ? item.legendItemWidth : 30,//图例项宽度默认30
                itemHeight: item.legendItemHeight ? item.legendItemHeight : 14,//图例项高度默认14
                textStyle: {
                    // color: base.ECHART_COLOR, 
                    color: '#eee',
                    // fontSize:12,
                    rich: item.legendRich ? item.legendRich : {
                        one: {
                            width: 60,
                            height: 16,
                            //  color: base.ECHART_COLOR,
                            fontSize: 12,
                            fontWeight: 700,
                        },
                        two: {
                            width: 60,
                            height: 16,
                            color: '#D0E3FD',
                            fontSize: 12,
                            fontWeight: 700,
                        },
                        three: {
                            width: 60,
                            height: 16,
                            color: '#D0E3FD',
                            fontSize: 12,
                            fontWeight: 700,
                        },
                    }
                },

                formatter: item.legendFormatter ? item.legendFormatter : (name) => {
                    return `{one|${name}}`;
                },
            },
            color: itemColorArr,
            dataZoom: item.dataZoom ? item.dataZoom : [ //默认dataZoom效果生效，但是不展示，需要在父组件传参中设置dataZoomShow为true,如果不需要dataZoom效果，则设置dataZoom为[]
                {
                    show: item.dataZoomShow ? item.dataZoomShow : false,//默认不显示dataZoom放大条
                    realtime: true,
                    start: 0,
                    end: 100,
                    bottom: item.dataZoomBottom1 ? item.dataZoomBottom1 : '0%',
                    height: item.dataZoomHeight ? item.dataZoomHeight : 20,//设置dataZoom高度,默认20px
                },
                {
                    type: "inside",
                    realtime: true,
                    start: 0,
                    end: 100,
                    bottom: item.dataZoomBottom2 ? item.dataZoomBottom2 : '0%',
                },
            ],
            grid: item.grid ? item.grid : {
                left: '3%',
                right: '5%',
                bottom: '6%',
                containLabel: true
            },
            xAxis: item.xAxis ? item.xAxis : [
                {
                    show: item.showXaxis ? item.showXaxis : true,//默认显示x轴
                    name: item.xname ? item.xname : '时间',//当没有在opt中传xname的时候，默认显示时间
                    type: item.xtype ? item.xtype : 'category',//默认显示类目轴
                    boundaryGap: item.boundaryGap ? item.boundaryGap : false,//默认不显示边界间隙
                    data: item.timeList,
                    axisLabel: {
                        color: item.xcolor ? item.xcolor : "#fff",
                        fontSize: item.xfontSize ? item.xfontSize : "12px",
                        fontWeight: item.xfontWeight ? item.xfontWeight : "normal",
                    },
                    nameTextStyle: {
                        color: '#fff',
                        verticalAlign: 'top',
                        padding: [8, 0, 0, 0],
                        fontSize: item.xNameFontSize ? item.xNameFontSize : "12px"
                    },
                    nameGap: item.xNameGap ? item.xNameGap : 0,
                    nameLocation: item.xnameLocation ? item.xnameLocation : 'end'
                }
            ],
            yAxis: item.yAxis ? item.yAxis : [
                {
                    show: item.showYaxis ? item.showYaxis : true,//默认显示y轴
                    name: item.yname ? item.yname : 'MW',//当没有在opt中传yname的时候，默认显示MW
                    type: item.ytype ? item.ytype : "value",//默认显示值轴,
                    nameGap: item.yNameGap ? item.yNameGap : 20,
                    nameRotate: 0,
                    // max:Math.max(...yAxisIndexArr)>0?Math.max(...yAxisIndexArr).toFixed(0):100,
                    // max: (Math.max(...yAxisIndexArr) > 0)? Math.max(...yAxisIndexArr).toFixed(0) : 0,
                    // min:Math.min(...yAxisIndexArr)>0?0:Math.min(...yAxisIndexArr).toFixed(0),
                    max: function (value) {
                        if (Math.abs(value.max) > Math.abs(value.min)) {
                            return Math.min(10000, Math.round(Math.abs(value.max) * 1.2));
                        } else {
                            return Math.min(10000, Math.round(Math.abs(value.min) * 1.2));
                        }
                    },
                    // min: function(value) {
                    //     if(Math.abs(value.max) > Math.abs(value.min)){
                    //         return (-Math.abs(value.max) * 1.2).toFixed(2);
                    //     }else{
                    //         return (-Math.abs(value.min) * 1.2).toFixed(2);
                    //     }
                    // },
                    min: function (value) {
                        return value.min.toFixed(2) > 0 ? 0 : value.min.toFixed(2);

                    },
                    splitLine: {
                        lineStyle: {
                            type: 'dashed',
                            width: 1,
                            color: 'rgba(223, 223, 223, 0.1)',
                            opacity: '1',
                        }
                    },
                    axisLabel: {
                        color: '#fff',
                        formatter: function (value) {
                            return value.toFixed(props.yAxisDecimalPlaces);
                        }
                    },
                    nameTextStyle: {
                        color: '#fff',
                        fontSize: item.yfontSize ? item.yfontSize : "12px"
                    },
                    nameTextStyle: {
                        color: '#fff',
                        fontSize: item.yNameFontSize ? item.yNameFontSize : "12px"
                    }
                    //默认以千分位显示，不想用的可以在这加一段
                    //axisLabel: {
                    //     //调整左侧Y轴刻度， 直接按对应数据显示
                    //     show: true,
                    //     showMinLabel: true,
                    //     showMaxLabel: true,
                    // },
                },
            ],
            series: item.data
        }, true)
    }
    myChart.on('legendselectchanged', (params) => {
        if (item?.doubleY) {
            updateChartAndCalculateMax(item, params, myChart);
        }
    });
    window.addEventListener("resize", () => {
        myChart.resize();
    });
};
const calculateMax = (item, name, myChart) => {
    yAxisIndexZeroArr = [];
    yAxisIndexOneArr = [];

    // 计算所有数据的最大值和最小值
    item.data.map(item => {
        if (item.yAxisIndex == 0) {
            yAxisIndexZeroArr.push(...item.data);
        } else if (item.yAxisIndex == 1) {
            yAxisIndexOneArr.push(...item.data);
        }
    });

    const max0 = Math.max(1, ...yAxisIndexZeroArr) || 1;
    const min0 = Math.min(0, ...yAxisIndexZeroArr) || 0;
    const max1 = Math.max(1, ...yAxisIndexOneArr) || 1;
    const min1 = Math.min(0, ...yAxisIndexOneArr) || 0;
    const ratio = (max0 - min0) / (max1 - min1);

    if (max0 < max1 * ratio) {
        y0Max = max1 * ratio;
        y1Max = max1;
    } else {
        y0Max = max0;
        y1Max = max0 / ratio;
    }

    if (min0 < min1 * ratio) {
        y0Min = min0;
        y1Min = min0 / ratio;
    } else {
        y0Min = min1 * ratio;
        y1Min = min1;
    }

    // 更新图表配置
    myChart.setOption({
        yAxis: [
            {
                max: function (value) {
                    if (Math.abs(value.max) > Math.abs(value.min)) {
                        return Math.min(10000, Math.round(Math.abs(value.max) * 1.2));
                    } else {
                        return Math.min(10000, Math.round(Math.abs(value.min) * 1.2));
                    }
                },
                min: function (value) {
                    if (yAxisIndexOneArr.length == 0) {
                        return value.min.toFixed(2) > 0 ? 0 : (value.min * 1.2).toFixed(2);
                    } else {
                        if (Math.abs(value.max) > Math.abs(value.min)) {
                            return Math.max(-10000, -Math.round(Math.abs(value.max) * 1.2));
                        } else {
                            return Math.max(-10000, -Math.round(Math.abs(value.min) * 1.2));
                        }
                    }

                }

            },
            {
                max: function (value) {
                    if (Math.abs(value.max) > Math.abs(value.min)) {
                        return Math.min(10000, Math.round(Math.abs(value.max) * 1.2));
                    } else {
                        return Math.min(10000, Math.round(Math.abs(value.min) * 1.2));
                    }
                },
                min: function (value) {
                    if (yAxisIndexZeroArr.length == 0) {
                        return value.min.toFixed(2) > 0 ? 0 : (value.min * 1.2).toFixed(2);
                    } else {
                        if (Math.abs(value.max) > Math.abs(value.min)) {
                            return Math.max(-10000, -Math.round(Math.abs(value.max) * 1.2));
                        } else {
                            return Math.max(-10000, -Math.round(Math.abs(value.min) * 1.2));
                        }
                    }

                }

            },
        ],
    });
};
const updateChartAndCalculateMax = (item, name, myChart) => {
    let filteredData = item.data;

    if (name) {
        const currentSelected = Object.keys(name.selected).filter(key => name.selected[key]);
        filteredData = item.data.filter(dataItem => currentSelected.includes(dataItem.name));
    }
    myChart.setOption({
        series: filteredData
    });
    calculateMax({ ...item, data: filteredData }, name, myChart);
};
const navtable = (item, aobj, bobj) => {

    aobj.value = [{
        title: item.title || '时间',//传参的时候需要给title赋值，否则默认为时间
        key: 'timeList',
    }]
    for (let j = 0; j < item.timeList.length; j++) {
        bobj.value.push({
            timeList: item.timeList[j],
        })
    }
    for (let i = 0; i < item.data.length; i++) {
        const { name } = item.data[i]; // 提取name

        const tableUnit = item.data[i].tableUnit; // 提取tableUnit
        const updatedName = tableUnit ? `${name}${tableUnit}` : name; // 根据是否有单位更新名称

        aobj.value.push({
            title: updatedName,
            key: name,
        });
        for (let j = 0; j < item.timeList.length; j++) {
            bobj.value[j][`${item.data[i].name}`] = item.data[i].data[j]

        }
    }
    //当为echarts的type为line的时候，若step为end，并且返回的数据补了最后一个点，则删除最后一个点，反之删除第一个点，需要在父组件传参中设置deleteLastPoint或者deleteFirstPoint为true
    if (item.deleteLastPoint) {
        bobj.value.pop()//删除最后一个点
    } else if (item.deleteFirstPoint) {
        bobj.value.shift()//删除第一个点
    }
}
onMounted(() => {
    initStationRef(opt.value);
    // stripeValue.value=tableControl.value.stripeValue;
    if ((props.opt as any).showTable !== undefined) { //当showTable传参的时候，更新showTable的值
        showTable.value = (props.opt as any).showTable
        if (showTable.value) {  //当showTable为true的时候，展示图表
            navtable(opt.value, eChartsTableData, stationreftableData);

        }
    }

})
</script>
<style></style>