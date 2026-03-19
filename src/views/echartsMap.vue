<template>
    <div class="echartsMap">
        <echartsMap @Update-Info="updateInfo" :markers="markers" :height="'1080px'" :width="'1920px'">
        </echartsMap>
    </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import echartsMap from '@/components/echartsMap.vue';

const markers = ref([])
const Nowtab = ref(0)
const cityCode = ref('')
const TreeRef = ref(null)
const onlineStatus = ref('')
const yesterday_Option = ref({})
const storagy_Option = ref({})
const load_Option = ref({})
const Info = ref<any>({})
const Profittotal = ref('')
const profitList = ref<any[]>([])
const chartData = ref<any[]>([])
const IsOnlineobj = ref({ income: 0, outcome: 0 })
const tableData = ref<any[]>([])
const tabList = ref([
    { tableData: [] },
    { tableData: [] },
    { tableData: [] }
])
const scrollnum = ref(1)

const updateInfo = (payload: any) => {
    Nowtab.value = 0
    if (payload.cityCode !== undefined) {
        cityCode.value = payload.cityCode;
    }
    if (TreeRef.value) {
        TreeRef.value.setFilterText(payload.cityName || '');
    }
    getinfo();
    yesterday_Option.value = {}
    storagy_Option.value = {}
    load_Option.value = {}
    nextTick(() => {
        getcurve();
    })
}
const getinfo = async () => {
    let url = '/screen/show/sys/info'
    let params = {
        cityCode: cityCode.value,
        onlineStatus: onlineStatus.value
    }
    try {
        // const res = await ajax_post_data(url, params)
        let res={
    "code": 200,
    "message": "操作成功",
    "data": {
        "stationSum": 123,
        "stationOnlineSum": 36,
        "stationOfflineSum": 87,
        "genInstallPower": 14.38,
        "storageCapacity": 39.214,
        "loadInstallPower": 74.788,
        "totalProfit": 4.12,
        "saveFee": 3.51,
        "demandProfit": 0,
        "chargeProfit": 116.649,
        "genProfit": 479.93,
        "storageProfit": 549.491,
        "stationMapList": [
            {
                "cityCode": "370000",
                "stationMapList": [
                    {
                        "stationId": "HM3702122408044",
                        "stationName": "海尔青岛创牌园区智慧微网项目",
                        "stationLng": 120.42,
                        "stationLat": 36.13,
                        "cityCode": "370212",
                        "onlineState": 2,
                        "onlineTime": "2025-06-05T14:26:56",
                        "offlineTimes": 6647,
                        "genInstallPower": 191,
                        "storageCapacity": 215,
                        "loadInstallPower": 760
                    },
                    {
                        "stationId": "HM3707822501067",
                        "stationName": "海尔-天旭园区光储充站点微网控制器项目",
                        "stationLng": 119.382689,
                        "stationLat": 36.043716,
                        "cityCode": "370782",
                        "onlineState": 2,
                        "onlineTime": "2025-12-01T12:05:59",
                        "offlineTimes": 2353,
                        "genInstallPower": 160,
                        "storageCapacity": 1000,
                        "loadInstallPower": 1200
                    },
                    {
                        "stationId": "HM370281250206B",
                        "stationName": "海尔-海士豪光储充荷一体化智慧能源管理项目",
                        "stationLng": 120.005681,
                        "stationLat": 36.334781,
                        "cityCode": "370281",
                        "onlineState": 2,
                        "onlineTime": "2025-07-30T14:58:37",
                        "offlineTimes": 5327,
                        "genInstallPower": 2200,
                        "storageCapacity": 215,
                        "loadInstallPower": 2000
                    },
                    {
                        "stationId": "HM370703250707D",
                        "stationName": "正帆潍坊光储项目",
                        "stationLng": 119.09,
                        "stationLat": 37.17,
                        "cityCode": "370703",
                        "onlineState": 1,
                        "onlineTime": "2026-03-05T04:28:09",
                        "offlineTimes": null,
                        "genInstallPower": 3408,
                        "storageCapacity": 30000,
                        "loadInstallPower": 15000
                    }
                ]
            },
            {
                "cityCode": "810000",
                "stationMapList": [
                    {
                        "stationId": "HM8100002208001",
                        "stationName": "CLP Town island项目A机",
                        "stationLng": 114.36815,
                        "stationLat": 22.33963,
                        "cityCode": "810113",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM8100002208002",
                        "stationName": "CLP Town island项目B机",
                        "stationLng": 114.36816,
                        "stationLat": 22.33963,
                        "cityCode": "810113",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM8100002012001",
                        "stationName": "CLP元朗站点",
                        "stationLng": 114.04112,
                        "stationLat": 22.44768,
                        "cityCode": "810118",
                        "onlineState": 1,
                        "onlineTime": "2026-03-01T03:02:40",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM8101122402029",
                        "stationName": "香港中华电力 LVSG Controller 推广应用项目-样机",
                        "stationLng": 114.204362,
                        "stationLat": 22.400173,
                        "cityCode": "810112",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "510000",
                "stationMapList": [
                    {
                        "stationId": "HM5101221908001",
                        "stationName": "办公室",
                        "stationLng": 104.086,
                        "stationLat": 30.411,
                        "cityCode": "510122",
                        "onlineState": 2,
                        "onlineTime": "2023-09-21T11:14:23",
                        "offlineTimes": 21602,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM5109032202001",
                        "stationName": "华泰1",
                        "stationLng": 105.55319,
                        "stationLat": 30.53887,
                        "cityCode": "510903",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5109032202002",
                        "stationName": "华泰2",
                        "stationLng": 105.55311,
                        "stationLat": 30.53886,
                        "cityCode": "510903",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5109032202003",
                        "stationName": "华泰3",
                        "stationLng": 105.55318,
                        "stationLat": 30.53887,
                        "cityCode": "510903",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5101222202004",
                        "stationName": "办公室测试机1",
                        "stationLng": 104.07275,
                        "stationLat": 30.57852,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5101142203001",
                        "stationName": "特隆美测试验证项目",
                        "stationLng": 104.24227,
                        "stationLat": 30.84172,
                        "cityCode": "510114",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM8100002208003",
                        "stationName": "华泰4",
                        "stationLng": 105.55318,
                        "stationLat": 30.53887,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5101222210004",
                        "stationName": "川开园区",
                        "stationLng": 103.977,
                        "stationLat": 30.4901,
                        "cityCode": "510116",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T04:46:22",
                        "offlineTimes": null,
                        "genInstallPower": 33,
                        "storageCapacity": 100,
                        "loadInstallPower": 330
                    },
                    {
                        "stationId": "HM5101072305017",
                        "stationName": "成都办公室Test@LHR",
                        "stationLng": 104.07275,
                        "stationLat": 30.57899,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM510107231001F",
                        "stationName": "办公室试验系统",
                        "stationLng": 103.977121,
                        "stationLat": 30.4901,
                        "cityCode": "510104",
                        "onlineState": 2,
                        "onlineTime": "2025-11-12T14:51:52",
                        "offlineTimes": 2807,
                        "genInstallPower": 33,
                        "storageCapacity": 100,
                        "loadInstallPower": 330
                    },
                    {
                        "stationId": "HM5101072312024",
                        "stationName": "成都广福桥街路侧停车位充储一体化项目",
                        "stationLng": 104.04106,
                        "stationLat": 30.646863,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": "2025-12-31T10:58:11",
                        "offlineTimes": 1635,
                        "genInstallPower": 0,
                        "storageCapacity": 200,
                        "loadInstallPower": 1640
                    },
                    {
                        "stationId": "HM5101072312025",
                        "stationName": "成都市武侯区广福桥北街(新筑小区)路侧停车充储一体化项目",
                        "stationLng": 104.04303,
                        "stationLat": 30.641822,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": "2025-11-17T20:40:07",
                        "offlineTimes": 2681,
                        "genInstallPower": 0,
                        "storageCapacity": 200,
                        "loadInstallPower": 1960
                    },
                    {
                        "stationId": "HM5101072405036",
                        "stationName": "成都办公室楼下充电站功率模块测试",
                        "stationLng": 104.072751,
                        "stationLat": 30.57852,
                        "cityCode": "510107",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T04:28:28",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM511602240803F",
                        "stationName": "广安爱众项目-A1(姚石桥村3.6社)",
                        "stationLng": 106.350803,
                        "stationLat": 30.595739,
                        "cityCode": "511621",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5116022408048",
                        "stationName": "广安爱众项目-D1(观塘镇新房2#台区)",
                        "stationLng": 106.74066,
                        "stationLat": 30.51369,
                        "cityCode": "511602",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5116022408049",
                        "stationName": "广安爱众项目-C1(茶店村9组)",
                        "stationLng": 106.575421,
                        "stationLat": 30.588086,
                        "cityCode": "511602",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5116022408040",
                        "stationName": "广安爱众项目-B1(姚石桥村7.8社)",
                        "stationLng": 106.350773,
                        "stationLat": 30.595716,
                        "cityCode": "511621",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM510112241105C",
                        "stationName": "十陵光储充换检综合能源站充电站",
                        "stationLng": 104.178021,
                        "stationLat": 30.64763,
                        "cityCode": "510112",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T14:00:33",
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM5107032412065",
                        "stationName": "家储测试项目",
                        "stationLng": 104.067579,
                        "stationLat": 30.578579,
                        "cityCode": "510107",
                        "onlineState": 1,
                        "onlineTime": "2026-03-05T11:44:48",
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 15.36,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM510112250206C",
                        "stationName": "龙泉三联市场示范充电站",
                        "stationLng": 104.284453,
                        "stationLat": 30.653657,
                        "cityCode": "510112",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T09:06:12",
                        "offlineTimes": null,
                        "genInstallPower": 110,
                        "storageCapacity": 430,
                        "loadInstallPower": 6720
                    },
                    {
                        "stationId": "HM5101072505075",
                        "stationName": "EMQ部署测试",
                        "stationLng": 104.060706,
                        "stationLat": 30.572374,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": "2025-06-10T15:31:04",
                        "offlineTimes": 6526,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5101042505076",
                        "stationName": "交投LIte版本设备",
                        "stationLng": 104.070706,
                        "stationLat": 30.573374,
                        "cityCode": "510104",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5101072507085",
                        "stationName": "成都办公室_Pro机柜",
                        "stationLng": 104.060587,
                        "stationLat": 30.572204,
                        "cityCode": "510112",
                        "onlineState": 2,
                        "onlineTime": "2026-02-03T17:34:11",
                        "offlineTimes": 812,
                        "genInstallPower": 310,
                        "storageCapacity": 430,
                        "loadInstallPower": 2160
                    },
                    {
                        "stationId": "HM5103042507081",
                        "stationName": "自贡市大安松林湾示范站点",
                        "stationLng": 105,
                        "stationLat": 29.42,
                        "cityCode": "510304",
                        "onlineState": 1,
                        "onlineTime": "2026-02-25T04:44:35",
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 8,
                        "loadInstallPower": 200
                    },
                    {
                        "stationId": "HM5101072508086",
                        "stationName": "成都交投迪卡侬成都天府店",
                        "stationLng": 104.064341,
                        "stationLat": 30.599544,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM5133292508087",
                        "stationName": "交投甘孜新龙中学",
                        "stationLng": 100.3124,
                        "stationLat": 30.945327,
                        "cityCode": "513329",
                        "onlineState": 1,
                        "onlineTime": "2026-03-05T04:02:44",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM510108250908A",
                        "stationName": "成都交投东广智慧园区",
                        "stationLng": 104.188329,
                        "stationLat": 30.687358,
                        "cityCode": "510108",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:53:26",
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 3200
                    },
                    {
                        "stationId": "HM510108250908B",
                        "stationName": "成都交投建设北路充电站",
                        "stationLng": 104.11445,
                        "stationLat": 30.676596,
                        "cityCode": "510108",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:54:14",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM510132251008C",
                        "stationName": "众易云上-新津事丰医疗器械项目",
                        "stationLng": 103.76,
                        "stationLat": 30.44,
                        "cityCode": "510118",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM510107251108D",
                        "stationName": "成都办公室测试机-243",
                        "stationLng": 106.762963,
                        "stationLat": 29.645243,
                        "cityCode": "510107",
                        "onlineState": 1,
                        "onlineTime": "2026-02-28T10:48:33",
                        "offlineTimes": null,
                        "genInstallPower": 111,
                        "storageCapacity": 220,
                        "loadInstallPower": 50
                    },
                    {
                        "stationId": "HM510107251109E",
                        "stationName": "世纪城展会",
                        "stationLng": 104.08,
                        "stationLat": 30.56,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51010725110A7",
                        "stationName": "世纪城展会2",
                        "stationLng": 104.08,
                        "stationLat": 30.56,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51010725110A8",
                        "stationName": "UNO-247-V2测试",
                        "stationLng": 104.07,
                        "stationLat": 30.58,
                        "cityCode": "510107",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51010426010AA",
                        "stationName": "五冶大厦研发项目",
                        "stationLng": 104.11,
                        "stationLat": 30.59,
                        "cityCode": "510104",
                        "onlineState": 1,
                        "onlineTime": "2026-03-08T03:57:21",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51130326030AE",
                        "stationName": "国网南充低电压治理项目1号点",
                        "stationLng": 106.13,
                        "stationLat": 30.79,
                        "cityCode": "511303",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51130326030AF",
                        "stationName": "国网南充低电压治理项目2号点",
                        "stationLng": 106.13,
                        "stationLat": 30.79,
                        "cityCode": "511303",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM51130326030B0",
                        "stationName": "国网南充低电压治理项目3号点",
                        "stationLng": 106.09,
                        "stationLat": 30.8,
                        "cityCode": "511303",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "110000",
                "stationMapList": [
                    {
                        "stationId": "HM1101062104001",
                        "stationName": "北京电科院--实验室",
                        "stationLng": 116.41694,
                        "stationLat": 39.86294,
                        "cityCode": "110106",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM1101062104002",
                        "stationName": "北京电科院--华商公寓",
                        "stationLng": 116.44631,
                        "stationLat": 39.87392,
                        "cityCode": "110106",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM1101022312023",
                        "stationName": "国网智慧车联网共享汽车智能通讯终端与区块链智能终端耦合模块项目",
                        "stationLng": 116.38527,
                        "stationLat": 39.8948,
                        "cityCode": "110102",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM110102240603C",
                        "stationName": "虚拟电厂终端集控模块-设备1",
                        "stationLng": 116.378817,
                        "stationLat": 39.888641,
                        "cityCode": "110102",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "530000",
                "stationMapList": [
                    {
                        "stationId": "HM530112241004D",
                        "stationName": "云南昆明红塔东路充电站",
                        "stationLng": 102.685678,
                        "stationLat": 24.975384,
                        "cityCode": "530112",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:52:53",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "350000",
                "stationMapList": [
                    {
                        "stationId": "HM3502132310020",
                        "stationName": "厦门市翔安物流园微网项目",
                        "stationLng": 118.26966,
                        "stationLat": 24.66959,
                        "cityCode": "350213",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM3504292505078",
                        "stationName": "中电飞华-泰宁酒店项目",
                        "stationLng": 117.108575,
                        "stationLat": 26.862508,
                        "cityCode": "350429",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T04:31:15",
                        "offlineTimes": null,
                        "genInstallPower": 760,
                        "storageCapacity": 430,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM3502052505077",
                        "stationName": "中电飞华-中航泰克园区",
                        "stationLng": 118.01,
                        "stationLat": 24.53,
                        "cityCode": "350205",
                        "onlineState": 2,
                        "onlineTime": "2025-09-16T10:22:17",
                        "offlineTimes": 4179,
                        "genInstallPower": 1624,
                        "storageCapacity": 225,
                        "loadInstallPower": 450
                    }
                ]
            },
            {
                "cityCode": "330000",
                "stationMapList": [
                    {
                        "stationId": "HM3301142303001",
                        "stationName": "杭州办公室",
                        "stationLng": 120.3463,
                        "stationLat": 30.29444,
                        "cityCode": "330114",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM3304812311021",
                        "stationName": "海宁市浙江大学国际校区1C工程大楼",
                        "stationLng": 120.73123,
                        "stationLat": 30.52285,
                        "cityCode": "330481",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM3302032312022",
                        "stationName": "宁波市君寰科创中心站点",
                        "stationLng": 121.468832,
                        "stationLat": 29.866635,
                        "cityCode": "330203",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T04:11:14",
                        "offlineTimes": null,
                        "genInstallPower": 800,
                        "storageCapacity": 233,
                        "loadInstallPower": 1200
                    },
                    {
                        "stationId": "HM3301022507084",
                        "stationName": "杭州虚拟电厂参展机器",
                        "stationLng": 120.197748,
                        "stationLat": 30.226833,
                        "cityCode": "330102",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "310000",
                "stationMapList": [
                    {
                        "stationId": "HM3101102306019",
                        "stationName": "上海杨浦滨江_零碳智慧综合能源中心",
                        "stationLng": 121.562027,
                        "stationLat": 31.272395,
                        "cityCode": "310110",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T04:37:22",
                        "offlineTimes": null,
                        "genInstallPower": 37.2,
                        "storageCapacity": 140,
                        "loadInstallPower": 250
                    },
                    {
                        "stationId": "HM3101052410055",
                        "stationName": "上海北外滩虚拟电厂项目-久隆国际大厦",
                        "stationLng": 121.436876,
                        "stationLat": 31.209265,
                        "cityCode": "310105",
                        "onlineState": 2,
                        "onlineTime": "2026-03-07T00:27:00",
                        "offlineTimes": 61,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM310115240302A",
                        "stationName": "融和霆金高路站充电站设备调控能力升级改造与车网互动技术服务项目",
                        "stationLng": 121.613722,
                        "stationLat": 31.30048,
                        "cityCode": "310115",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM310109240402F",
                        "stationName": "芜湖精艺铜业有限公司",
                        "stationLng": 121.5164,
                        "stationLat": 31.257154,
                        "cityCode": "310109",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "440000",
                "stationMapList": [
                    {
                        "stationId": "HM4403112104003",
                        "stationName": "南网电动公明南站",
                        "stationLng": 113.90819,
                        "stationLat": 22.77215,
                        "cityCode": "440311",
                        "onlineState": 2,
                        "onlineTime": "2022-12-08T19:32:52",
                        "offlineTimes": 28482,
                        "genInstallPower": 443.6,
                        "storageCapacity": 516,
                        "loadInstallPower": 9600
                    },
                    {
                        "stationId": "HM510182220800D",
                        "stationName": "龙华冠霖充电站工程",
                        "stationLng": 114.06655,
                        "stationLat": 22.68685,
                        "cityCode": "440309",
                        "onlineState": 2,
                        "onlineTime": "2023-03-31T15:34:26",
                        "offlineTimes": 25774,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440304220700E",
                        "stationName": "宝安区沙井黄埔充电站工程",
                        "stationLng": 113.85488,
                        "stationLat": 22.72263,
                        "cityCode": "440306",
                        "onlineState": 2,
                        "onlineTime": "2023-03-31T15:34:22",
                        "offlineTimes": 25774,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403112210001",
                        "stationName": "深圳龙岗方兴路充电站工程",
                        "stationLng": 114.28706,
                        "stationLat": 22.73086,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": "2023-03-31T15:24:08",
                        "offlineTimes": 25774,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440311221200F",
                        "stationName": "南网电动雪仙丽充电站",
                        "stationLng": 113.86575,
                        "stationLat": 22.79142,
                        "cityCode": "440311",
                        "onlineState": 2,
                        "onlineTime": "2023-03-31T15:24:40",
                        "offlineTimes": 25774,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403112212001",
                        "stationName": "南网电动临时",
                        "stationLng": 114.06878,
                        "stationLat": 22.60792,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": "2023-04-20T14:02:19",
                        "offlineTimes": 25295,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403042304016",
                        "stationName": "深圳宝安机场充电站",
                        "stationLng": 113.820004,
                        "stationLat": 22.606145,
                        "cityCode": "440306",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T11:02:56",
                        "offlineTimes": null,
                        "genInstallPower": 240,
                        "storageCapacity": 0,
                        "loadInstallPower": 15720
                    },
                    {
                        "stationId": "HM4404032306018",
                        "stationName": "珠海有序充电站",
                        "stationLng": 113.55905,
                        "stationLat": 22.28083,
                        "cityCode": "440402",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403042312026",
                        "stationName": "深圳市民中心V2G示范站",
                        "stationLng": 114.06616,
                        "stationLat": 22.547179,
                        "cityCode": "440304",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4413022401027",
                        "stationName": "广东省惠州市盛弘智慧工厂项目设备1",
                        "stationLng": 114.348695,
                        "stationLat": 23.010263,
                        "cityCode": "441302",
                        "onlineState": 2,
                        "onlineTime": "2026-02-21T08:07:17",
                        "offlineTimes": 389,
                        "genInstallPower": 592,
                        "storageCapacity": 400,
                        "loadInstallPower": 1760
                    },
                    {
                        "stationId": "HM440307240302B",
                        "stationName": "南网技改-深圳添力新能源坂田充电站",
                        "stationLng": 114.082491,
                        "stationLat": 22.649731,
                        "cityCode": "440307",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:53:30",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440307240302C",
                        "stationName": "南网技改-乾龙物流园充电站",
                        "stationLng": 114.140875,
                        "stationLat": 22.687628,
                        "cityCode": "440307",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:52:05",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440304240302D",
                        "stationName": "南网技改-福田新一代1号场站",
                        "stationLng": 114.067812,
                        "stationLat": 22.57865,
                        "cityCode": "440304",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:54:13",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440304240402E",
                        "stationName": "南网技改-福田新一代1号场站B2层",
                        "stationLng": 114.067772,
                        "stationLat": 22.578574,
                        "cityCode": "440304",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:58:18",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403042408047",
                        "stationName": "福田供电局莲花山充电站",
                        "stationLng": 114.08,
                        "stationLat": 22.55,
                        "cityCode": "440304",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T14:00:11",
                        "offlineTimes": null,
                        "genInstallPower": 150,
                        "storageCapacity": 215,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM4403092405035",
                        "stationName": "南网技改-龙华中集八方充电站",
                        "stationLng": 114.108652,
                        "stationLat": 22.729641,
                        "cityCode": "440309",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403072405037",
                        "stationName": "南网技改-大鹏新区大鹏街道惠民充电站",
                        "stationLng": 114.500922,
                        "stationLat": 22.568102,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403072405038",
                        "stationName": "南网技改-大鹏新区新大集散中心二期充电站-设备1",
                        "stationLng": 114.516762,
                        "stationLat": 22.538108,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403072405039",
                        "stationName": "南网技改-大鹏新区新大集散中心二期充电站-设备2",
                        "stationLng": 114.516762,
                        "stationLat": 22.538059,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4403072408042",
                        "stationName": "南网技改-大鹏官湖社区2号停车场充电站",
                        "stationLng": 114.422148,
                        "stationLat": 22.602342,
                        "cityCode": "440307",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4407832408041",
                        "stationName": "南沙环市西路停车场电动汽车超充站",
                        "stationLng": 113.315569,
                        "stationLat": 22.47429,
                        "cityCode": "440783",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:53:52",
                        "offlineTimes": null,
                        "genInstallPower": 371.7,
                        "storageCapacity": 0,
                        "loadInstallPower": 120
                    },
                    {
                        "stationId": "HM4403092408043",
                        "stationName": "南网电动深国际华南数字展厅-样机",
                        "stationLng": 114.053084,
                        "stationLat": 22.610396,
                        "cityCode": "440309",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440105240904B",
                        "stationName": "广州从化鳌头综合能源站",
                        "stationLng": 113.41,
                        "stationLat": 23.66,
                        "cityCode": "440105",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:53:51",
                        "offlineTimes": null,
                        "genInstallPower": 50,
                        "storageCapacity": 215,
                        "loadInstallPower": 3380
                    },
                    {
                        "stationId": "HM440402240904C",
                        "stationName": "珠海横琴现代供电服务体验中心充电站",
                        "stationLng": 113.51682,
                        "stationLat": 22.264542,
                        "cityCode": "440402",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440112241004F",
                        "stationName": "广州尖峰科技口袋公园充电站",
                        "stationLng": 113.528541,
                        "stationLat": 23.143895,
                        "cityCode": "440112",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4401182412066",
                        "stationName": "广州增城荔兴路停车场充电站",
                        "stationLng": 113.82,
                        "stationLat": 23.29,
                        "cityCode": "440118",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:56:01",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM440304250306E",
                        "stationName": "深圳虚拟电厂项目-福田枢纽站",
                        "stationLng": 114.063836,
                        "stationLat": 22.543939,
                        "cityCode": "440304",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:52:39",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM440304250306D",
                        "stationName": "深圳虚拟电厂项目-深铁置业大厦站",
                        "stationLng": 114.063836,
                        "stationLat": 22.543939,
                        "cityCode": "440304",
                        "onlineState": 2,
                        "onlineTime": "2025-11-10T10:38:16",
                        "offlineTimes": 2859,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4413022401028",
                        "stationName": "广东省惠州市盛弘智慧工厂项目设备2",
                        "stationLng": 114.348695,
                        "stationLat": 23.010263,
                        "cityCode": "441302",
                        "onlineState": 2,
                        "onlineTime": "2025-12-14T00:02:43",
                        "offlineTimes": 2053,
                        "genInstallPower": 0,
                        "storageCapacity": 600,
                        "loadInstallPower": 2000
                    },
                    {
                        "stationId": "HM4403042404030",
                        "stationName": "南网技改-福田局充电站(菠萝树底下)",
                        "stationLng": 114.090486,
                        "stationLat": 22.552006,
                        "cityCode": "440304",
                        "onlineState": 2,
                        "onlineTime": "2025-06-24T10:32:37",
                        "offlineTimes": 6195,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4406062505074",
                        "stationName": "精艺股份马龙工厂",
                        "stationLng": 113.171049,
                        "stationLat": 22.910278,
                        "cityCode": "440606",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T00:01:18",
                        "offlineTimes": null,
                        "genInstallPower": 1770,
                        "storageCapacity": 2330,
                        "loadInstallPower": 3500
                    },
                    {
                        "stationId": "HM440304250607B",
                        "stationName": "深圳会展中心2展馆充电站",
                        "stationLng": 114.07,
                        "stationLat": 22.54,
                        "cityCode": "440304",
                        "onlineState": 1,
                        "onlineTime": "2026-01-21T04:49:21",
                        "offlineTimes": null,
                        "genInstallPower": 0,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM440112250707F",
                        "stationName": "广州黄埔绿地中央广场站",
                        "stationLng": 113.430505,
                        "stationLat": 23.163741,
                        "cityCode": "440112",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM4401122507080",
                        "stationName": "南方电网科学城超级充换电站",
                        "stationLng": 113.430506,
                        "stationLat": 23.163742,
                        "cityCode": "440112",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": 210,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM4403112511093",
                        "stationName": "深圳光明虹桥公园站B",
                        "stationLng": 113.97,
                        "stationLat": 22.75,
                        "cityCode": "440311",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM44130226020B1",
                        "stationName": "南网电动-惠供能源充电站",
                        "stationLng": 114.451122,
                        "stationLat": 23.084363,
                        "cityCode": "441302",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:58:22",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "500000",
                "stationMapList": [
                    {
                        "stationId": "HM5001052509088",
                        "stationName": "B245005_长安光储充及V2G平台项目-2",
                        "stationLng": 106.74408,
                        "stationLat": 29.544406,
                        "cityCode": "500105",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:52:08",
                        "offlineTimes": null,
                        "genInstallPower": 230,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM5001052509089",
                        "stationName": "B245005_长安光储充及V2G平台项目-3",
                        "stationLng": 106.75408,
                        "stationLat": 29.554406,
                        "cityCode": "500105",
                        "onlineState": 2,
                        "onlineTime": "2025-11-06T18:36:09",
                        "offlineTimes": 2947,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM500105251108F",
                        "stationName": "B245005_长安光储充及V2G平台项目-待使用设备1",
                        "stationLng": 106.762963,
                        "stationLat": 29.645243,
                        "cityCode": "500105",
                        "onlineState": 2,
                        "onlineTime": "2025-11-19T10:17:08",
                        "offlineTimes": 2643,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5001052511091",
                        "stationName": "广州金雁佳园站",
                        "stationLng": 113.49,
                        "stationLat": 23.04,
                        "cityCode": "500105",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5001052511090",
                        "stationName": "长安光储充及V2G平台项目-待使用设备3",
                        "stationLng": 106.77,
                        "stationLat": 29.65,
                        "cityCode": "500105",
                        "onlineState": 2,
                        "onlineTime": "2025-11-19T10:35:44",
                        "offlineTimes": 2643,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5001052511092",
                        "stationName": "深圳光明虹桥公园站A",
                        "stationLng": 113.97,
                        "stationLat": 22.75,
                        "cityCode": "500105",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "360000",
                "stationMapList": [
                    {
                        "stationId": "HM360702251108E",
                        "stationName": "江西中石化迎宾充电站",
                        "stationLng": 114.945186,
                        "stationLat": 25.819237,
                        "cityCode": "360702",
                        "onlineState": 1,
                        "onlineTime": "2026-03-04T14:10:29",
                        "offlineTimes": null,
                        "genInstallPower": 110,
                        "storageCapacity": 147,
                        "loadInstallPower": 0
                    }
                ]
            },
            {
                "cityCode": "610000",
                "stationMapList": [
                    {
                        "stationId": "HM6101022503071",
                        "stationName": "金沙江能源展示样机",
                        "stationLng": null,
                        "stationLat": null,
                        "cityCode": "610102",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "520000",
                "stationMapList": [
                    {
                        "stationId": "HM5205212503070",
                        "stationName": "贵州大方火储联调项目-设备2",
                        "stationLng": 105.572808,
                        "stationLat": 27.107414,
                        "cityCode": "520521",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302411056",
                        "stationName": "南方电网贵州电动-贵阳花果园一期S2区充电站",
                        "stationLng": 106.671283,
                        "stationLat": 26.551272,
                        "cityCode": "522730",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:56:03",
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302411057",
                        "stationName": "南方电网贵州电动-贵阳花果园一期R1区充电站",
                        "stationLng": 106.671636,
                        "stationLat": 26.558284,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM522730241105A",
                        "stationName": "南方电网贵州电动-贵阳花果园二期A北区充电站",
                        "stationLng": 106.692716,
                        "stationLat": 26.574155,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302411058",
                        "stationName": "南方电网贵州电动-贵阳花果园一期V区充电站",
                        "stationLng": 106.684786,
                        "stationLat": 26.567191,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302411059",
                        "stationName": "南方电网贵州电动-贵阳花果园一期U区充电站",
                        "stationLng": 106.670762,
                        "stationLat": 26.568787,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM522730241205D",
                        "stationName": "南方电网贵州电动-贵州花果园二期A南区充电站",
                        "stationLng": 106.693159,
                        "stationLat": 26.571441,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM522730241205E",
                        "stationName": "南方电网贵州电动-贵州花果园二期C区充电站",
                        "stationLng": 106.689863,
                        "stationLat": 26.568395,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM522730241205F",
                        "stationName": "南方电网贵州电动-贵州花果园二期K区充电站",
                        "stationLng": 106.679629,
                        "stationLat": 26.555869,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302412060",
                        "stationName": "南方电网贵州电动-贵州花果园二期M区充电站",
                        "stationLng": 106.681982,
                        "stationLat": 26.55873,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5227302412061",
                        "stationName": "南方电网贵州电动-贵州花果园二期W2区充电站 ",
                        "stationLng": 106.680925,
                        "stationLat": 26.575631,
                        "cityCode": "522730",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM520521250306F",
                        "stationName": "贵州大方火储联调项目-设备1",
                        "stationLng": 105.572809,
                        "stationLat": 27.107416,
                        "cityCode": "520521",
                        "onlineState": 2,
                        "onlineTime": "2025-06-17T17:46:49",
                        "offlineTimes": 6356,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    },
                    {
                        "stationId": "HM5201132505073",
                        "stationName": "南网电动贵州白云龙井超充站",
                        "stationLng": 106.623043,
                        "stationLat": 26.669533,
                        "cityCode": "520113",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T14:00:54",
                        "offlineTimes": null,
                        "genInstallPower": 25.3,
                        "storageCapacity": 0,
                        "loadInstallPower": 0
                    }
                ]
            },
            {
                "cityCode": "340000",
                "stationMapList": [
                    {
                        "stationId": "HM34010426010AC",
                        "stationName": "合肥杨林路国家级车网示范站",
                        "stationLng": 117.149212,
                        "stationLat": 31.837201,
                        "cityCode": "340104",
                        "onlineState": 2,
                        "onlineTime": "2026-03-09T12:43:53",
                        "offlineTimes": 1,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            },
            {
                "cityCode": "450000",
                "stationMapList": [
                    {
                        "stationId": "HM4501082405033",
                        "stationName": "广西壮族自治区南宁市五象综合能源充电站",
                        "stationLng": 108.396568,
                        "stationLat": 22.755661,
                        "cityCode": "450108",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:55:52",
                        "offlineTimes": null,
                        "genInstallPower": 150,
                        "storageCapacity": 430,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM4501082405034",
                        "stationName": "广西壮族自治区南宁市五象供电分局充电站",
                        "stationLng": 108.318556,
                        "stationLat": 22.793523,
                        "cityCode": "450108",
                        "onlineState": 2,
                        "onlineTime": "2026-01-22T12:48:23",
                        "offlineTimes": 1105,
                        "genInstallPower": 100,
                        "storageCapacity": 200,
                        "loadInstallPower": 0
                    },
                    {
                        "stationId": "HM110102240603B",
                        "stationName": "东兰智慧能源站",
                        "stationLng": 107.398435,
                        "stationLat": 24.530504,
                        "cityCode": "451224",
                        "onlineState": 1,
                        "onlineTime": "2026-03-09T13:53:01",
                        "offlineTimes": null,
                        "genInstallPower": 160,
                        "storageCapacity": 0,
                        "loadInstallPower": 1258
                    },
                    {
                        "stationId": "HM4501032507082",
                        "stationName": "广西南宁国际会展中心智慧超充站",
                        "stationLng": 108.379759,
                        "stationLat": 22.808643,
                        "cityCode": "450103",
                        "onlineState": 2,
                        "onlineTime": null,
                        "offlineTimes": null,
                        "genInstallPower": null,
                        "storageCapacity": null,
                        "loadInstallPower": null
                    }
                ]
            }
        ],
        "stationOfflineList": [
            {
                "stationId": "HM34010426010AC",
                "stationName": "合肥杨林路国家级车网示范站",
                "stationLng": 117.149212,
                "stationLat": 31.837201,
                "cityCode": "340104",
                "onlineState": 2,
                "onlineTime": "2026-03-09T12:43:53",
                "offlineTimes": 1,
                "genInstallPower": null,
                "storageCapacity": null,
                "loadInstallPower": null
            },
            {
                "stationId": "HM3101052410055",
                "stationName": "上海北外滩虚拟电厂项目-久隆国际大厦",
                "stationLng": 121.436876,
                "stationLat": 31.209265,
                "cityCode": "310105",
                "onlineState": 2,
                "onlineTime": "2026-03-07T00:27:00",
                "offlineTimes": 61,
                "genInstallPower": 0,
                "storageCapacity": 0,
                "loadInstallPower": 0
            },
            {
                "stationId": "HM4413022401027",
                "stationName": "广东省惠州市盛弘智慧工厂项目设备1",
                "stationLng": 114.348695,
                "stationLat": 23.010263,
                "cityCode": "441302",
                "onlineState": 2,
                "onlineTime": "2026-02-21T08:07:17",
                "offlineTimes": 389,
                "genInstallPower": 592,
                "storageCapacity": 400,
                "loadInstallPower": 1760
            }
        ],
        "stationForeAccuracyList": [
            {
                "stationName": "深圳宝安机场充电站",
                "forecastAccuracy": 93.38
            },
            {
                "stationName": "上海杨浦滨江_零碳智慧综合能源中心",
                "forecastAccuracy": 88.45
            },
            {
                "stationName": "福田供电局莲花山充电站",
                "forecastAccuracy": 87.99
            },
            {
                "stationName": "龙泉三联市场示范充电站",
                "forecastAccuracy": 90.86
            },
            {
                "stationName": "精艺股份马龙工厂",
                "forecastAccuracy": 91.51
            },
            {
                "stationName": "成都办公室测试机-243",
                "forecastAccuracy": 95.87
            },
            {
                "stationName": "江西中石化迎宾充电站",
                "forecastAccuracy": 99.13
            },
            {
                "stationName": "正帆潍坊光储项目",
                "forecastAccuracy": 94.53
            }
        ]
    }
    }
        if (res.code == 200) {
            Info.value = res.data
            let total = res.data.chargeProfit + res.data.genProfit + res.data.storageProfit
            Profittotal.value = total ? total.toFixed(3) : '-'
            profitList.value = [
                {
                    label: '光伏收益',
                    value: res.data.genProfit != null ? res.data.genProfit : '-',
                    percent: res.data.genProfit != null ? ((res.data.genProfit / total) * 100).toFixed(2) : '0',
                    unit: '万元'
                },
                {
                    label: '储能收益',
                    value: res.data.storageProfit != null ? res.data.storageProfit : '-',
                    percent: res.data.storageProfit != null ? ((res.data.storageProfit / total) * 100).toFixed(2) : '0',
                    color: 'linear-gradient(90.00deg, rgba(12.3515625, 82.30174255371094, 164.6875, 0),rgba(44, 134, 240, 1) 78%,rgba(137, 192, 255, 1) 100%);',
                    unit: '万元'
                },
                {
                    label: '充电桩收益',
                    value: res.data.chargeProfit != null ? res.data.chargeProfit : '-',
                    percent: res.data.chargeProfit != null ? ((res.data.chargeProfit / total) * 100).toFixed(2) : '0',
                    unit: '万元'
                }
            ]
            chartData.value = [
                {
                    value: res.data.genProfit, name: '光伏收益', itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: 'rgba(31, 183, 115, 0.1)' },
                            { offset: 1, color: 'rgba(31, 183, 115, 1)' }
                        ])
                    }, img: 'img2'
                },
                {
                    value: res.data.storageProfit, name: '储能收益', itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: 'rgba(26, 192, 198, 0.1)' },
                            { offset: 1, color: 'rgba(26, 192, 198, 1)' }
                        ])
                    }, img: 'img3'
                },
                {
                    value: res.data.chargeProfit, name: '充电桩收益', itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: 'rgba(28, 103, 255, 0.1)' },
                            { offset: 1, color: 'rgba(28, 103, 255, 1)' }
                        ])
                    }, img: 'img1'
                },
            ]
            if (Array.isArray(res.data.stationOfflineList)) {
                IsOnlineobj.value = {
                    income: res.data.stationOfflineList.filter(item => item.onlineState == 1).length,
                    outcome: res.data.stationOfflineList.filter(item => item.onlineState == 2).length,
                }
                tableData.value = res.data.stationOfflineList
                if (res.data.stationOfflineList.length > 5) {
                    scrollnum.value = 2
                } else {
                    scrollnum.value = 1
                }
            } else {
                tableData.value = []
            }
            if (Array.isArray(res.data.stationForeAccuracyList)) {
                tabList.value[0].tableData = res.data.stationForeAccuracyList.filter(item => item.forecastAccuracy > 90).sort((a, b) => b.forecastAccuracy - a.forecastAccuracy)
                tabList.value[1].tableData = res.data.stationForeAccuracyList.filter(item => item.forecastAccuracy > 80 && item.forecastAccuracy < 90).sort((a, b) => b.forecastAccuracy - a.forecastAccuracy)
                tabList.value[2].tableData = res.data.stationForeAccuracyList.filter(item => item.forecastAccuracy < 80).sort((a, b) => b.forecastAccuracy - a.forecastAccuracy)
            } else {
                tabList.value[0].tableData = tabList.value[1].tableData = tabList.value[2].tableData = []
            }
            if (Array.isArray(res.data.stationMapList)) {
                markers.value = res.data.stationMapList.map(item => {
                    return {
                        areaCode: item.cityCode,
                        value: item.stationMapList.length,
                        stationMapList: item.stationMapList
                    }
                })
            }
        } else {
            // ElMessage.error(res.message)
        }
    } catch (error) {
        console.log(error);
    }
}

const getcurve = () => {
    // 这里可以添加获取曲线数据的逻辑
    console.log('getcurve called');
}
</script>