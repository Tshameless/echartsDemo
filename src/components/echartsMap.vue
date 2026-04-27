<template>
    <div class=''>
       <div class="map" ref="mapref" :style="{ height: height, width: width }"></div>
       <div class="back" v-if="currentLevel != 'province'" @click="goback">
       </div>
       <div v-if="isShow" class="stationInfo" :style="{ 'left': xleft, 'top': xtop }">
          <p>
             {{ stationInfo.stationName }}
          </p>
       </div>
    </div>
 </template>
 <script setup lang="ts">
 import { ref, onMounted, watch } from 'vue'
 import * as echarts from 'echarts'
 import provicejson from '@/assets/json/provice.json';
 import cityjson from '@/assets/json/city.json';
 import bgcImage from '@/assets/img/big_screen.png'
 import station_logo from '@/assets/img/station_logo.png'
 import online_logo from '@/assets/img/online_logo.png'
 import unonline_logo from '@/assets/img/unonline_logo.png'
 import { useRouter } from 'vue-router';
 
 const router = useRouter()
 
 const mapref = ref<HTMLDivElement | null>(null)
 
 interface CityFeatureProperties {
    adcode: number;
    name: string;
    center: [number, number];
    parent?: {
       adcode: number;
    };
 }
 
 interface CityFeature {
    type: string;
    properties: CityFeatureProperties;
 }
 
 interface CityJson {
    type: string;
    features: CityFeature[];
 }
 interface ProvinceFeatureProperties {
    adcode: number;
    name: string;
    center: [number, number];
    centroid: [number, number];
    childrenNum: number;
    level: string;
    parent: {
       adcode: number;
    };
    subFeatureIndex: number;
    acroutes: number[];
 }
 interface ProvinceFeature {
    type: "Feature";
    properties: ProvinceFeatureProperties;
    geometry: any;
 }
 interface ProvinceJson {
    type: "FeatureCollection";
    features: ProvinceFeature[];
 }
 interface Props {
    height: string
    width: string
    markers: Array<any>
 }
 
 const typedCityJson = cityjson as unknown as CityJson;
 const typedProvinceJson = provicejson as ProvinceJson;
 const props = withDefaults(defineProps<Props>(), {
    height: '500px',
    width: '500px',
    markers: () => []
 })
 const xleft = ref('')
 const xtop = ref('')
 const isShow = ref(false)
 const provincemakers = ref<Array<{ label: string, value: [number, number, number] }>>([])
 const Urbanmakers = ref<Array<{ label?: string, value: [number, number, number | string], isStation?: boolean, stationId?: string, stationName?: string, onlineState?: number, areaCode?: string }>>([])
 const Citymakers = ref<Array<{ stationId: string, label: string, value: [number, number, string], onlineState?: number, stationName?: string }>>([])
 const CityObj = ref<Array<any>>([])
 const currentLevel = ref<'province' | 'district' | 'city'>('province')
 const parentDom = ref<string | null>('')
 const onlineStatus = ref<string>('')
 let mycharts: echarts.ECharts | null = null;
 const emit = defineEmits<{
    (e: 'Update-Info', payload: { level: string; cityCode?: string; cityName?: string }): void
 }>()
 const proviceName = ref<string>('')
 const stationInfo = ref({
    stationName: ''
 })
 
 // 直辖市列表
 const municipalities = ['北京市', '天津市', '上海市', '重庆市', '香港特别行政区', '澳门特别行政区']
 
 // 判断是否为直辖市
 const isMunicipality = (provinceName: string): boolean => {
    return municipalities.includes(provinceName)
 }
 const getJSON = async (adcode: string) => {
    try {
       const modules = import.meta.glob('/public/citys/*.json');
       const filePath = `/public/citys/${adcode}.json`;
       if (modules[filePath]) {
          const module: any = await modules[filePath]();
          return module.default || module;
       }
       console.warn(`未找到文件 ${filePath}`);
       return null;
    } catch (error) {
       console.error('导入JSON文件时出错', error);
       return null;
    }
 }
 const initMap = () => {
    cleanupChart()
    if (mapref.value) {
       mycharts = echarts.init(mapref.value);
    }
    echarts.registerMap("province", provicejson as any);
    currentLevel.value = 'province';
    let currentProvince = '';
    let option = {
       tooltip: {
          show: false,
          trigger: "item",
          triggerOn: 'click'
       },
       geo: [
          {
             show: true,
             map: 'province',
             zlevel: 8,
             layoutCenter: ['50%', '50%'],
             layoutSize: '80%',
             label: {
                show: false
             },
             roam: false,
             scaleLimit: {
                min: 1,
                max: 2
             },
             itemStyle: {
                normal: {
                   color: 'transparent',
                   borderWidth: 1,
                   borderColor: "rgb(167, 204, 217)",
                   shadowColor: "rgb(167, 204, 217)",
                   shadowOffsetY: 0,
                   shadowBlur: 5,
                },
             },
             emphasis: {
                show: false,
                itemStyle: {
                   areaColor: '#283c5695'
                },
                label: {
                   show: true,
                   color: '#ffffff',
                }
             },
             regions: [],
          },
          {
             map: 'province',
             roam: false,
             scaleLimit: {
                min: 1,
                max: 2
             },
             layoutCenter: ['50%', '51%'],
             layoutSize: '80%',
             top: '11.7%',
             silent: true,
             zlevel: 3,
             itemStyle: {
                normal: {
                   borderWidth: 1,
                   borderColor: "rgba(58,149,253,0.1)",
                   shadowColor: "rgba(58,149,253,0.3)",
                   shadowOffsetY: 5,
                   shadowBlur: 2,
                   areaColor: "transpercent",
                },
             },
          },
       ],
       series: [
          {
             name: 'marker',
             type: 'scatter',
             map: 'province',
             coordinateSystem: 'geo',
             symbol: 'image://' + station_logo,
             symbolSize: [33, 43],
             label: {
                show: true,
                formatter: function (parm: any) {
                   return `{tline|${parm.value[2]}}`
                },
                rich: {
                   tline: {
                      fontFamily: 'YouSheBiaoTiHei',
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: 15,
                      letterSpacing: 0,
                      textAlign: 'left',
                      textTransform: 'uppercase'
                   },
                },
                textStyle: {
                   background: 'linear-gradient(148.78deg, rgba(255, 255, 255, 1), rgba(72, 216, 120, 1) 100%)',
                   '-webkit-background-clip': 'text',
                   '-webkit-text-fill-color': 'transparent',
                   'background-clip': 'text',
                   'text-fill-color': 'transparent',
                   fontFamily: 'YouSheBiaoTiHei',
                   fontSize: 20,
                   fontWeight: 400,
                   lineHeight: 15,
                   letterSpacing: 0,
                   textAlign: 'left',
                   textTransform: 'uppercase'
                },
                position: 'inside',
                align: 'center',
                verticalAlign: 'middle',
                offset: [0, -3]
             },
             itemStyle: {
                opacity: 1
             },
             zlevel: 10,
             data: provincemakers.value,
             animation: true,
             animationDuration: 500,
             animationEasing: 'sinusoidalInOut',
             animationRepeat: true,
             animationDelay: function (idx: number) {
                return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
             }
          },
          {
             type: 'map',
             map: 'province',
             zlevel: 6,
             layoutCenter: ['50%', '50%'],
             layoutSize: '80%',
             label: {
                show: true,
                color: '#fff',
             },
             roam: false,
             silent: true,
             scaleLimit: {
                min: 1,
                max: 2
             },
             itemStyle: {
                normal: {
                   areaColor: {
                      type: 'pattern',
                      image: bgcImage,
                      repeat: 'no-repeat',
                      x: 110,
                      y: -20,
                      scaleX: 0.45,
                      scaleY: 0.45,
                   },
                   borderColor: '#3e4e71',
                   borderWidth: 1,
                },
             },
          },
       ],
       animation: false,
    };
    if (mycharts) {
       mycharts.setOption(option);
       mycharts.off('click').on('click', function (params: any) {
          // 这里点击城市后，会显示在左边的搜索框
          let name = ''
          if (params.seriesType == "scatter") {
             name = params.data.label
             if (params.data.stationId) {
                router.push({
                   path: `/stationDetail/${params.data.stationId}`,
                   query: {
                      label: params.data.stationId,
                      labelName: params.data.stationName
                   },
                })
             }
          } else {
             name = params.name
          }
          parentDom.value = name
          if (currentLevel.value === 'province') {
             proviceName.value = name
             let provinceItem = provicejson.features.find(item => item.properties.name == name);
             if (provinceItem) {
                currentProvince = name;
                if (isMunicipality(name)) {
                   currentLevel.value = 'district';
                   parentDom.value = name;
                   let arr: any[] = []
                   CityObj.value.forEach((item) => {
                      if (item.cityCode == provinceItem.properties.adcode) {
                         arr = item.stationMapList
                      }
                   })
                   Urbanmakers.value = arr.map(item => {
                      return {
                         isStation: true,
                         stationId: item.stationId,
                         stationName: item.stationName,
                         onlineState: item.onlineState,
                         value: [item.stationLng, item.stationLat, '']
                      }
                   })
                   let districtJson = {
                      "type": "FeatureCollection" as const,
                      "features": typedCityJson.features.filter((item) => {
                         if (item.properties && item.properties.parent) {
                            return item.properties.parent.adcode.toString().substring(0, 2) ===
                               provinceItem.properties.adcode.toString().substring(0, 2);
                         }
                         return false;
                      })
                   };
                   if (districtJson.features.length > 0) {
                      echarts.registerMap("district", districtJson as any);
                      let districtOption = {
                         geo: [
                            {
                               layoutCenter: ['50%', '40%'],
                               layoutSize: '65%',
                               map: 'district',
                               roam: false,
                               scaleLimit: {
                                  min: 1,
                                  max: 2
                               },
                            },
                            {
                               layoutCenter: ['50%', '41%'],
                               layoutSize: '65%',
                               map: 'district',
                               roam: false,
                               scaleLimit: {
                                  min: 1,
                                  max: 2
                               },
                            }
                         ],
                         series: [
                            {
                               name: 'marker',
                               type: 'scatter',
                               map: 'district',
                               coordinateSystem: 'geo',
                               symbol: function (value: any, params: any) {
                                  const dataItem = Urbanmakers.value[params.dataIndex];
                                  if (dataItem && dataItem.onlineState !== undefined) {
                                     return dataItem.onlineState === 1 ? 'image://' + online_logo : 'image://' + unonline_logo;
                                  }
                                  return 'image://' + online_logo;
                               },
                               symbolSize: [33, 58],
                               label: {
                                  show: false,
                                  formatter: function (parm: any) {
                                     return parm.value[2]
                                  },
                                  textStyle: {
                                     color: '#fff'
                                  }
                               },
 
                               itemStyle: {
                                  opacity: 1
                               },
                               zlevel: 10,
                               data: Urbanmakers.value,
                               animation: true,
                               animationDuration: 500,
                               animationEasing: 'sinusoidalInOut',
                               animationRepeat: true,
                               animationDelay: function (idx: number) {
                                  return idx * 200;
                               }
                            },
                            {
                               map: 'district',
                               layoutCenter: ['50%', '40%'],
                               layoutSize: '65%',
                               silent: true,
                               roam: false,
                               scaleLimit: {
                                  min: 1,
                                  max: 2
                               },
                               label: {
                                  show: true,
                                  color: '#fff',
                               },
                               itemStyle: {
                                  normal: {
                                     areaColor: {
                                        type: 'pattern',
                                        image: bgcImage,
                                        repeat: 'no-repeat',
                                        x: 50,
                                        y: 50,
                                        scaleX: 0.45,
                                        scaleY: 0.45,
                                     },
                                     borderColor: '#3e4e71',
                                     borderWidth: 1,
                                  },
                               },
                            }
                         ]
                      };
                      if (mycharts) {
                         mycharts.setOption(districtOption);
                      }
                   }
                } else {
                   if (mycharts) {
                      Urbanmakers.value = [];
                      let districtJson = {
                         "type": "FeatureCollection" as const,
                         "features": typedCityJson.features.filter((item) => {
                            if (item.properties && item.properties.parent) {
                               return item.properties.parent.adcode.toString().substring(0, 2) ===
                                  provinceItem.properties.adcode.toString().substring(0, 2);
                            }
                            return false;
                         })
                      };
 
                      if (districtJson.features.length > 0) {
                         currentLevel.value = 'district';
                         echarts.registerMap("district", districtJson as any);
                         let districtOption = {
                            geo: [
                               {
                                  layoutCenter: ['50%', '40%'],
                                  layoutSize: '65%',
                                  map: 'district',
                                  roam: false,
                                  scaleLimit: {
                                     min: 1,
                                     max: 2
                                  },
                               },
                               {
                                  layoutCenter: ['50%', '41%'],
                                  layoutSize: '65%',
                                  map: 'district',
                                  roam: false,
                                  scaleLimit: {
                                     min: 1,
                                     max: 2
                                  },
                               }
                            ],
                            series: [
                               {
                                  name: 'marker',
                                  type: 'scatter',
                                  map: 'district',
                                  coordinateSystem: 'geo',
                                  symbol: 'image://' + station_logo,
                                  symbolSize: [33, 43],
                                  label: {
                                     show: true,
                                     formatter: function (parm: any) {
                                        return `{tline|${parm.value[2]}}`
                                     },
                                     rich: {
                                        tline: {
                                           fontFamily: 'YouSheBiaoTiHei',
                                           fontSize: 20,
                                           fontWeight: 400,
                                           lineHeight: 15,
                                           letterSpacing: 0,
                                           textAlign: 'left',
                                           textTransform: 'uppercase'
                                        },
                                     },
                                     textStyle: {
                                        background: 'linear-gradient(148.78deg, rgba(255, 255, 255, 1), rgba(72, 216, 120, 1) 100%)',
                                        '-webkit-background-clip': 'text',
                                        '-webkit-text-fill-color': 'transparent',
                                        'background-clip': 'text',
                                        'text-fill-color': 'transparent',
                                        fontFamily: 'YouSheBiaoTiHei',
                                        fontSize: 20,
                                        fontWeight: 400,
                                        lineHeight: 15,
                                        letterSpacing: 0,
                                        textAlign: 'left',
                                        textTransform: 'uppercase'
                                     },
                                     position: 'inside',
                                     align: 'center',
                                     verticalAlign: 'middle',
                                     offset: [0, -3]
                                  },
                                  itemStyle: {
                                     opacity: 1
                                  },
                                  zlevel: 10,
                                  data: Urbanmakers.value,
                                  animation: true,
                                  animationDuration: 500,
                                  animationEasing: 'sinusoidalInOut',
                                  animationRepeat: true,
                                  animationDelay: function (idx: number) {
                                     return idx * 200;
                                  }
                               },
                               {
                                  map: 'district',
                                  layoutCenter: ['50%', '40%'],
                                  layoutSize: '65%',
                                  silent: true,
                                  roam: false,
                                  scaleLimit: {
                                     min: 1,
                                     max: 2
                                  },
                                  label: {
                                     show: true,
                                     color: '#fff',
                                  },
                                  itemStyle: {
                                     normal: {
                                        areaColor: {
                                           type: 'pattern',
                                           image: bgcImage,
                                           repeat: 'no-repeat',
                                           x: 50,
                                           y: 50,
                                           scaleX: 0.45,
                                           scaleY: 0.45,
                                        },
                                        borderColor: '#3e4e71',
                                        borderWidth: 1,
                                     },
                                  },
                               }
                            ]
                         };
                         mycharts.setOption(districtOption);
                      }
                   }
                }
             }
          }
          else if (currentLevel.value === 'district') {
             if (isMunicipality(proviceName.value)) {
                if (params.seriesType == "scatter" && params.data?.isStation) {
                   router.push({
                      path: `/stationDetail/${params.data.stationId}`,
                      query: {
                         label: params.data.stationId,
                         labelName: params.data.stationName
                      },
                   })
                }
                return; // 阻止进入第三层
             }
             currentLevel.value = 'city';
             currentProvince = name;
 
             let arr: any[] = []
             let provinceItem = typedCityJson.features.find(item => item.properties.name == currentProvince);
             if (provinceItem && provinceItem.properties) {
                CityObj.value.forEach((item) => {
                   if (item.cityCode == provinceItem.properties.adcode) {
                      arr = item.stationMapList
                   }
                })
             }
             Citymakers.value = arr.map(item => {
                return {
                   stationId: item.stationId,
                   label: item.address,
                   value: [item.stationLng, item.stationLat, '']
                }
             })
             handleCityClick(provinceItem);
          }
       });
       mycharts.on('mouseover', function (params: any) {
          if ((currentLevel.value == 'city' || (currentLevel.value == 'district' && isMunicipality(proviceName.value))) && params.data?.isStation) {
             if (mycharts) {
                stationInfo.value = params.data;
                const coord = mycharts.convertToPixel({ geoIndex: 0 }, [params.data.value[0], params.data.value[1]]);
                if (coord && coord.length >= 2) {
                   xleft.value = coord[0] + 'px';
                   xtop.value = coord[1] + 20 + 'px';
                } else {
                   xleft.value = params.event.offsetX + 'px';
                   xtop.value = params.event.offsetY + 20 + 'px';
                }
                isShow.value = true;
             }
          }
       })
       mycharts.on('mouseout', function (params: any) {
          isShow.value = false;
       })
 
    }
 }
 
 const handleCityClick = async (provinceItem: any) => {
    if (provinceItem && provinceItem.properties && provinceItem.properties.adcode) {
       const city = await getJSON(provinceItem.properties.name);
       if (city) {
          echarts.registerMap("city", city);
          let cityOption = {
             geo: [
                {
                   map: 'city',
                   layoutCenter: ['50%', '40%'],
                   layoutSize: '60%',
                },
                {
                   map: 'city',
                   layoutCenter: ['50%', '41%'],
                   layoutSize: '60%',
                }
             ],
             series: [
                {
                   name: 'marker',
                   type: 'scatter',
                   map: 'city',
                   coordinateSystem: 'geo',
                   symbol: function (value: any, params: any) {
                      const dataItem = Citymakers.value[params.dataIndex];
                      if (dataItem && dataItem.onlineState !== undefined) {
                         return dataItem.onlineState === 1 ? 'image://' + online_logo : 'image://' + unonline_logo;
                      }
                      return 'image://' + online_logo;
                   },
                   symbolSize: [33, 58],
                   label: {
                      show: true,
                      formatter: function (parm: any) {
                         return parm.value[2]
                      },
                      textStyle: {
                         color: '#fff'
                      }
                   },
                   itemStyle: {
                      opacity: 1
                   },
                   zlevel: 10,
                   data: Citymakers.value,
 
                   animation: true,
                   animationDuration: 500,
                   animationEasing: 'sinusoidalInOut',
                   animationRepeat: true,
                   animationDelay: function (idx: number) {
                      return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
                   }
                },
 
                {
                   map: 'city',
                   layoutCenter: ['50%', '40%'],
                   layoutSize: '60%',
                   label: {
                      show: true,
                      color: '#fff',
                   },
                   silent: true,
                   itemStyle: {
                      normal: {
                         areaColor: {
                            type: 'pattern',
                            image: bgcImage,
                            repeat: 'no-repeat',
                            x: 50,
                            y: 50,
                            scaleX: 0.45,
                            scaleY: 0.45,
                         },
                         borderColor: '#3e4e71',
                         borderWidth: 1,
                      },
                   },
                }
             ]
          };
          if (mycharts) {
             mycharts.setOption(cityOption);
          }
       }
    } else {
 
    }
 }
 
 const backToProvince = (mycharts: echarts.ECharts | null) => {
    provincemakers.value = [];
    if (Array.isArray(props.markers)) {
       props.markers.forEach((item_: any) => {
          let provice = provicejson.features.find(item => item.properties.adcode == item_.areaCode)
          if (provice && provice.properties.center) {
             provincemakers.value.push({
                label: provice.properties.name,
                value: [provice.properties.center[0], provice.properties.center[1], item_.value]
             })
          }
       })
    }
 
    echarts.registerMap("province", typedProvinceJson);
    currentLevel.value = 'province';
 
    let provinceOption = {
       tooltip: {
          show: false,
          trigger: "item",
          triggerOn: 'click'
       },
       geo: [
          {
             show: true,
             map: 'province',
             zlevel: 8,
             layoutCenter: ['50%', '50%'],
             layoutSize: '80%',
             label: {
                show: false
             },
             roam: false,
             scaleLimit: {
                min: 1,
                max: 2
             },
             itemStyle: {
                normal: {
                   color: 'transparent',
                   borderWidth: 1,
                   borderColor: "rgb(167, 204, 217)",
                   shadowColor: "rgb(167, 204, 217)",
                   shadowOffsetY: 0,
                   shadowBlur: 5,
                },
             },
             emphasis: {
                show: false,
                itemStyle: {
                   areaColor: '#283c5695'
                },
                label: {
                   show: true,
                   color: '#ffffff',
                }
             },
             regions: [],
          },
          {
             map: 'province',
             roam: false,
             scaleLimit: {
                min: 1,
                max: 2
             },
             layoutCenter: ['50%', '51%'],
             layoutSize: '80%',
             top: '11.7%',
             silent: true,
             zlevel: 3,
             itemStyle: {
                normal: {
                   borderWidth: 1,
                   borderColor: "rgba(58,149,253,0.1)",
                   shadowColor: "rgba(58,149,253,0.3)",
                   shadowOffsetY: 5,
                   shadowBlur: 2,
                   areaColor: "transpercent",
                },
             },
             emphasis: {
                show: false,
                areaColor: "transparent",
                label: {
                   show: false,
                }
             },
          },
       ],
       series: [
          {
             name: 'marker',
             type: 'scatter',
             coordinateSystem: 'geo',
             symbol: 'image://' + station_logo, //气泡
             symbolSize: [33, 43],
             label: {
                show: true,
                formatter: function (parm: any) {
                   return `{tline|${parm.value[2]}}`
                },
                rich: {
                   tline: {
                      fontFamily: 'YouSheBiaoTiHei',
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: 15,
                      letterSpacing: 0,
                      textAlign: 'left',
                      textTransform: 'uppercase'
                   },
                },
                textStyle: {
                   background: 'linear-gradient(148.78deg, rgba(255, 255, 255, 1), rgba(72, 216, 120, 1) 100%)',
                   '-webkit-background-clip': 'text',
                   '-webkit-text-fill-color': 'transparent',
                   'background-clip': 'text',
                   'text-fill-color': 'transparent',
                   fontFamily: 'YouSheBiaoTiHei',
                   fontSize: 20,
                   fontWeight: 400,
                   lineHeight: 15,
                   letterSpacing: 0,
                   textAlign: 'left',
                   textTransform: 'uppercase'
                },
                position: 'inside',
                align: 'center',
                verticalAlign: 'middle',
                offset: [0, -3]
             },
             itemStyle: {
                opacity: 1
             },
             zlevel: 10,
             data: provincemakers.value,
             emphasis: {
                show: false,
                itemStyle: {
                   areaColor: '#283c5695'
                },
                label: {
                   show: true,
                   color: '#ffffff',
                }
             },
             animation: true,
             animationDuration: 500,
             animationEasing: 'sinusoidalInOut',
             animationRepeat: true,
             animationDelay: function (idx: number) {
                return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
             }
          },
          {
             type: 'map',
             map: 'province',
             zlevel: 6,
             layoutCenter: ['50%', '50%'],
             layoutSize: '80%',
             silent: true,
             label: {
                show: true,
                color: '#fff',
             },
             roam: false,
             scaleLimit: {
                min: 1,
                max: 2
             },
             itemStyle: {
                normal: {
                   areaColor: {
                      type: 'pattern',
                      image: bgcImage,
                      repeat: 'no-repeat',
                      x: 110,
                      y: -20,
                      scaleX: 0.45,
                      scaleY: 0.45,
                   },
                   borderColor: '#3e4e71',
                   borderWidth: 1,
                },
             },
          },
       ],
       animation: false,
    };
    if (mycharts) {
       mycharts.setOption(provinceOption);
    }
 };
 const backToCity = (mycharts: echarts.ECharts | null) => {
    parentDom.value = proviceName.value
    if (mycharts) {
       let districtOption = {
          geo: [
             {
                layoutCenter: ['50%', '40%'],
                layoutSize: '65%',
                map: 'district',
                roam: false,
                scaleLimit: {
                   min: 1,
                   max: 2
                },
             },
             {
                layoutCenter: ['50%', '41%'],
                layoutSize: '65%',
                map: 'district',
                roam: false,
                scaleLimit: {
                   min: 1,
                   max: 2
                },
             }
          ],
          series: [
             {
                name: 'marker',
                type: 'scatter',
                map: 'district',
                coordinateSystem: 'geo',
                symbol: 'image://' + station_logo,
                symbolSize: [33, 43],
                label: {
                   show: true,
                   formatter: function (parm: any) {
                      return `{tline|${parm.value[2]}}`
                   },
                   rich: {
                      tline: {
                         fontFamily: 'YouSheBiaoTiHei',
                         fontSize: 20,
                         fontWeight: 400,
                         lineHeight: 15,
                         letterSpacing: 0,
                         textAlign: 'left',
                         textTransform: 'uppercase'
                      },
                   },
                   textStyle: {
                      background: 'linear-gradient(148.78deg, rgba(255, 255, 255, 1), rgba(72, 216, 120, 1) 100%)',
                      '-webkit-background-clip': 'text',
                      '-webkit-text-fill-color': 'transparent',
                      'background-clip': 'text',
                      'text-fill-color': 'transparent',
                      fontFamily: 'YouSheBiaoTiHei',
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: 15,
                      letterSpacing: 0,
                      textAlign: 'left',
                      textTransform: 'uppercase'
                   },
                   position: 'inside',
                   align: 'center',
                   verticalAlign: 'middle',
                   offset: [0, -3]
                },
                itemStyle: {
                   opacity: 1
                },
                zlevel: 10,
                data: Urbanmakers.value,
                animation: true,
                animationDuration: 500,
                animationEasing: 'sinusoidalInOut',
                animationRepeat: true,
                animationDelay: function (idx: number) {
                   return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
                }
             },
             {
                map: 'district',
                layoutCenter: ['50%', '40%'],
                layoutSize: '65%',
                roam: false,
                silent: true,
                scaleLimit: {
                   min: 1,
                   max: 2
                },
                label: {
                   show: true,
                   color: '#fff',
                },
                itemStyle: {
                   normal: {
                      areaColor: {
                         type: 'pattern',
                         image: bgcImage,
                         repeat: 'no-repeat',
                         x: 50,
                         y: 50,
                         scaleX: 0.45,
                         scaleY: 0.45,
                      },
                      borderColor: '#3e4e71',
                      borderWidth: 1,
                   },
                },
             }
          ]
       };
       mycharts.setOption(districtOption);
    }
 };
 watch(() => currentLevel.value, (newValue) => {
    let cityCode: string | undefined;
    if (newValue === 'province') {
       cityCode = '';
    } else if (newValue === 'district') {
       const provinceItem = provicejson.features.find(item => item.properties.name == parentDom.value);
       if (provinceItem) {
          cityCode = provinceItem.properties.adcode.toString().slice(0, 2);
       }
    } else if (newValue === 'city') {
       const cityItem = typedCityJson.features.find(item => item.properties.name == parentDom.value);
       if (cityItem && cityItem.properties && cityItem.properties.adcode) {
          cityCode = cityItem.properties.adcode.toString().slice(0, 4);
       }
    }
    emit('Update-Info', { level: currentLevel.value, cityCode, cityName: parentDom.value || undefined });
 })
 const reinitMap = () => {
    cleanupChart();
    initMap();
 }
 
 const goback = () => {
    if (currentLevel.value == 'district') {
       parentDom.value = ''; // 返回到省级时清空城市名称
       currentLevel.value = 'province';
       backToProvince(mycharts);
    } else if (currentLevel.value == 'city') {
       parentDom.value = proviceName.value; // 返回到地区级时设置为省份名称
       currentLevel.value = 'district';
       backToCity(mycharts);
    }
 }
 
 const cleanupChart = () => {
    if (mycharts) {
       mycharts.off('click');
       mycharts.dispose();
       mycharts = null;
    }
 };
 
 watch(() => props.markers, (val) => {
    if (val) {
       if (Array.isArray(val)) {
          if (currentLevel.value == 'province') {
             provincemakers.value = [];
             val.forEach((item_: any) => {
                let provice = provicejson.features.find(item => item.properties.adcode == item_.areaCode)
                if (provice && provice.properties.center) {
                   provincemakers.value.push({
                      label: provice.properties.name,
                      value: [provice.properties.center[0], provice.properties.center[1], item_.value]
                   })
                }
             })
             if (mycharts) {
                const option = {
                   series: [
                      {
                         name: 'marker',
                         data: provincemakers.value,
 
                         animation: true,
                         animationDuration: 500,
                         animationEasing: 'sinusoidalInOut',
                         animationRepeat: true,
                         animationDelay: function (idx: number) {
                            return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
                         }
                      }
                   ]
                };
                mycharts.setOption(option);
             } else {
                initMap()
             }
          } else if (currentLevel.value == 'district') {
             if (mycharts) {
                // 检查是否为直辖市
                if (isMunicipality(proviceName.value)) {
                   // 直辖市显示所有站点
                   Urbanmakers.value = [];
                   val.forEach((item_: any) => {
                      if (item_.stationMapList) {
                         item_.stationMapList.forEach((station: any) => {
                            Urbanmakers.value.push({
                               isStation: true,
                               stationId: station.stationId,
                               stationName: station.stationName,
                               onlineState: station.onlineState,
                               value: [station.stationLng, station.stationLat, 0]
                            })
                         })
                      }
                   })
                   const option = {
                      series: [
                         {
                            name: 'marker',
                            symbol: function (value: any, params: any) {
                               const dataItem = Urbanmakers.value[params.dataIndex];
                               if (dataItem && dataItem.onlineState !== undefined) {
                                  return dataItem.onlineState === 1 ? 'image://' + online_logo : 'image://' + unonline_logo;
                               }
                               return 'image://' + online_logo;
                            },
                            symbolSize: [33, 58],
                            data: Urbanmakers.value,
                            label: {
                               show: false
                            },
                            emphasis: {
                               show: false,
                               areaColor: "transparent",
                               label: {
                                  show: false,
                               }
                            },
                            animation: true,
                            animationDuration: 500,
                            animationEasing: 'sinusoidalInOut',
                            animationRepeat: true,
                            animationDelay: function (idx: number) {
                               return idx * 200;
                            }
                         }
                      ]
                   };
                   mycharts.setOption(option);
                } else {
                   Urbanmakers.value = [];
 
                   val.forEach((item_: any) => {
                      let city = typedCityJson.features.find(item => item.properties.adcode == item_.areaCode)
                      if (city && city.properties.center) {
                         Urbanmakers.value.push({
                            label: city.properties?.name,
                            areaCode: item_.areaCode,
                            value: [city.properties.center[0], city.properties.center[1], item_.value]
                         })
                      } else {
                         // 如果找不到城市或中心坐标，降级使用第一个站点坐标
                         Urbanmakers.value.push({
                            areaCode: item_.areaCode,
                            value: [item_.stationMapList[0].stationLng, item_.stationMapList[0].stationLat, item_.value]
                         })
                      }
                   })
                   const option = {
                      series: [
                         {
                            name: 'marker',
                            data: Urbanmakers.value,
                            animation: true,
                            animationDuration: 500,
                            animationEasing: 'sinusoidalInOut',
                            animationRepeat: true,
 
                            animationDelay: function (idx: number) {
                               return idx * 200;
                            }
                         }
                      ]
                   };
                   mycharts.setOption(option);
                }
             }
          } else if (currentLevel.value == 'city') {
             if (mycharts) {
                Citymakers.value = [];
                val.forEach((item_: any) => {
                   if (item_.stationMapList) {
                      let arr = item_.stationMapList
                      Citymakers.value.push(...arr.map((item: any) => {
                         return {
                            isStation: true,
                            stationId: item.stationId,
                            value: [item.stationLng, item.stationLat, ''],
                            onlineState: item.onlineState,
                            stationName: item.stationName
                         }
                      }))
                   }
                })
                const option = {
                   series: [
                      {
                         name: 'marker',
                         data: Citymakers.value,
 
                         animation: true,
                         animationDuration: 500,
                         animationEasing: 'sinusoidalInOut',
                         animationRepeat: true,
                         animationDelay: function (idx: number) {
                            return idx * 200; // 每个点延迟 200ms 开始动画，创造波浪效果
                         }
                      }
                   ]
                };
                mycharts.setOption(option);
             }
          }
       }
    }
 }, { deep: true })
 
 onMounted(() => {
 })
 </script>
 <style scoped lang='scss'>
 .back {
    width: 99px;
    height: 52px;
    background: url(/src/assets/img/back.png) no-repeat;
    background-size: contain;
    position: absolute;
    top: 138px;
    right: 509px;
    z-index: 99;
    cursor: pointer;
 }
 
 /* 添加浮动动画样式 */
 @keyframes float {
    0% {
       transform: translateY(0px);
    }
 
    50% {
       transform: translateY(-10px);
    }
 
    100% {
       transform: translateY(0px);
    }
 }
 
 .float-animation {
    animation: float 2s ease-in-out infinite;
 }
 
 .stationInfo {
    position: absolute;
    padding: 8px;
    font-family: 'YouSheBiaoTiHei-Bold', sans-serif;
    font-size: 12px;
    color: #A6C7E7;
    background-color: #08172e;
    border-radius: 6px;
    box-shadow: 0px 0px 5px rgba(167, 204, 217, 0.8);
 }
 </style>
