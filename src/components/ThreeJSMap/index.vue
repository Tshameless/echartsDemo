<template>
  <div class="three-map-wrap">
    <!-- 顶部：全国地图仅显示站点总数，下钻后显示当前层级统计 -->
    <div class="top-stats">
      <div class="stat-item">
        <span class="stat-label">站点统计</span>
        <span class="stat-value online">{{ stationStats.online }} 在线</span>
        <span class="stat-value offline">{{ stationStats.offline }} 离线</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ totalStationLabel }}</span>
        <span class="stat-num">{{ stationStats.total }}</span>
      </div>
    </div>
    <div class="map-container" ref="containerRef">
      <canvas ref="canvasRef"></canvas>

      <!-- 面包屑 / 返回 -->
      <div v-if="currentLevel > 0" class="back-btn" @click="goBack">
        &lt; 返回上一级
      </div>
      <div v-if="breadcrumb.length > 1" class="breadcrumb">
        <template v-for="(item, index) in breadcrumb" :key="item.name + index">
          <span class="crumb" :class="{ active: index === breadcrumb.length - 1 }" @click="goToLevel(index)">
            {{ item.name }}
          </span>
          <span v-if="index < breadcrumb.length - 1" class="separator">/</span>
        </template>
      </div>

      <!-- 图例 -->
      <div class="legend">
        <span class="legend-item"><i class="dot online"></i> 在线</span>
        <span class="legend-item"><i class="dot offline"></i> 离线</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createMapMeshFromGeoJSON, type GeoJSONCollection, type GeoFeature, type LabelPosition } from './mapRenderer'
import { getStationsForLevel, getProvinceStationCount, getCityStationCount, type Station } from './stationData'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

// 层级对应的 JSON 映射：当前层级点击的 adcode -> 下一层 JSON 路径
const LEVEL_MAP: Record<number, string> = {
  510000: 'sichuan',   // 四川省 -> 四川地图
  510100: 'chengdu',   // 成都市 -> 成都地图
}

const getJsonUrl = (name: string): string => new URL(`./${name}.json`, import.meta.url).href

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let renderer: THREE.WebGLRenderer
let controls: InstanceType<typeof OrbitControls>
const MAP_DEPTH = 0.06
const FILL_COLOR_NORMAL = 0x1a4a6e
const FILL_COLOR_HIGHLIGHT = 0x2d6ba8
let mapGroup: THREE.Group | null = null
/** 全国地图时显示的省份名称+站点数标签组 */
let labelGroup: THREE.Group | null = null
/** 站点标记组 (Level 2) */
let stationGroup: THREE.Group | null = null
let css2dRenderer: InstanceType<typeof CSS2DRenderer> | null = null
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2
let animationId: number
let onPointerLeave: (() => void) | null = null

const currentLevel = ref(0)
const breadcrumb = ref<{ name: string; adcode?: number }[]>([{ name: '中国' }])
const hoverFeature = ref<GeoFeature | null>(null)

/** 当前层级站点统计（全国页仅显示站点总数，下钻后为当前省/市） */
const stationStats = computed(() => {
  const level = currentLevel.value
  const crumbs = breadcrumb.value
  const provinceAdcode = level >= 1 ? crumbs[1]?.adcode : undefined
  const cityAdcode = level === 2 ? crumbs[crumbs.length - 1]?.adcode : undefined
  const list = getStationsForLevel(level, provinceAdcode, cityAdcode)
  const online = list.filter((s) => s.online).length
  return { total: list.length, online, offline: list.length - online }
})

/** 当前统计范围说明（全国不标，下钻后显示“四川省”/“成都市”） */
const totalStationLabel = computed(() => {
  const level = currentLevel.value
  const crumbs = breadcrumb.value
  if (level === 0) return '全国站点总数'
  if (level === 1) return `${crumbs[1]?.name || ''}站点总数`
  if (level === 2) return `${crumbs[2]?.name || ''}站点总数`
  return '站点总数'
})

const loadGeoJSON = async (name: string): Promise<GeoJSONCollection> => {
  const url = getJsonUrl(name)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json()
}

const addMapToScene = (geojson: GeoJSONCollection): { meshes: THREE.Mesh[]; labelPositions: LabelPosition[]; transform: (lng: number, lat: number) => [number, number] } => {
  const { group, meshes, labelPositions, transform } = createMapMeshFromGeoJSON(geojson, {
    fillColor: 0x1a4a6e,
    fillOpacity: 0.92,
    strokeColor: 0x3d7ab5,
    depth: MAP_DEPTH
  })
  mapGroup = group
  scene.add(group)
  return { meshes, labelPositions, transform }
}

const clearLabels = () => {
  if (labelGroup) {
    labelGroup.traverse((obj) => {
      if (obj instanceof CSS2DObject && obj.element && obj.element.parentNode) {
        obj.element.parentNode.removeChild(obj.element)
      }
    })
    scene.remove(labelGroup)
    labelGroup = null
  }
  if (stationGroup) {
    stationGroup.traverse((obj) => {
      if (obj instanceof CSS2DObject && obj.element && obj.element.parentNode) {
        obj.element.parentNode.removeChild(obj.element)
      }
    })
    scene.remove(stationGroup)
    stationGroup = null
  }
}

/** 仅在全国地图（level 0）时调用，仅对有站点的省份显示站点数 */
const addRegionLabels = (labelPositions: LabelPosition[]) => {
  clearLabels()
  const group = new THREE.Group()
  labelPositions.forEach(({ feature, x, y }) => {
    const adcode = feature.properties?.adcode ?? 0
    let count = 0
    
    if (currentLevel.value === 0) {
      count = getProvinceStationCount(adcode)
    } else if (currentLevel.value === 1) {
      // 在省份层级，显示各城市的站点数
      count = getCityStationCount(adcode).length
    }
    
    if (count === 0) return
    const div = document.createElement('div')
    div.className = 'province-label'
    div.textContent = String(count)
    const label = new CSS2DObject(div)
    label.position.set(x, y, MAP_DEPTH)
    group.add(label)
  })
  labelGroup = group
  scene.add(group)
}

/** 在地图上添加具体站点标记 (Level 2) */
const addStationMarkers = (stations: Station[], transform: (lng: number, lat: number) => [number, number]) => {
  console.log('Adding station markers', stations)
  const group = new THREE.Group()
  stations.forEach((station) => {
    const [x, y] = transform(station.lng, station.lat)
    
    // Wrapper for CSS2DObject (positioned by renderer)
    const wrapper = document.createElement('div')
    
    // Container for layout and centering
    const container = document.createElement('div')
    container.className = 'station-item'
    
    const marker = document.createElement('div')
    marker.className = `station-marker ${station.online ? 'online' : 'offline'}`
    // 可选：添加 tooltip 或点击事件
    marker.title = station.name
    
    const name = document.createElement('div')
    name.className = 'station-name'
    name.textContent = station.name
    
    container.appendChild(marker)
    container.appendChild(name)
    wrapper.appendChild(container)
    
    const label = new CSS2DObject(wrapper)
    label.position.set(x, y, MAP_DEPTH + 0.02) // 稍微高一点
    group.add(label)
  })
  stationGroup = group
  scene.add(group)
}

const clearMap = () => {
  clearLabels()
  if (mapGroup) {
    scene.remove(mapGroup)
    mapGroup.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
        obj.geometry?.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m: THREE.Material) => m.dispose())
          else obj.material.dispose()
        }
      }
    })
    mapGroup = null
  }
}

const showLevel = async (level: number, adcode?: number) => {
  clearMap()
  currentLevel.value = level

  let jsonName: string
  if (level === 0) {
    jsonName = 'china'
    breadcrumb.value = [{ name: '中国' }]
  } else if (level === 1 && adcode === 510000) {
    jsonName = 'sichuan'
    breadcrumb.value = [{ name: '中国' }, { name: '四川省', adcode: 510000 }]
  } else if (level === 2 && adcode === 510100) {
    jsonName = 'chengdu'
    breadcrumb.value = [
      { name: '中国' },
      { name: '四川省', adcode: 510000 },
      { name: '成都市', adcode: 510100 }
    ]
  } else {
    jsonName = 'china'
    breadcrumb.value = [{ name: '中国' }]
  }

  const geojson = await loadGeoJSON(jsonName)
  const { labelPositions, transform } = addMapToScene(geojson)
  if ((level === 0 || level === 1) && labelPositions.length > 0) {
    addRegionLabels(labelPositions)
  } else if (level === 2) {
    // Level 2: 显示具体站点
    // 获取当前城市的站点
    const cityAdcode = breadcrumb.value[breadcrumb.value.length - 1]?.adcode
    if (cityAdcode) {
      console.log('Fetching stations for cityAdcode:', cityAdcode)
      const stations = getCityStationCount(cityAdcode)
      console.log('Stations found:', stations.length)
      if (stations.length > 0) {
        addStationMarkers(stations, transform)
      } else {
        console.warn('No stations found for this city.')
      }
    }
  }
}

const goToLevel = (index: number) => {
  if (index === breadcrumb.value.length - 1) return
  const item = breadcrumb.value[index]
  if (index === 0) {
    showLevel(0)
  } else if (item.adcode === 510000) {
    showLevel(1, 510000)
  } else if (item.adcode === 510100) {
    showLevel(2, 510100)
  }
}

const goBack = () => {
  if (currentLevel.value > 0) {
    goToLevel(currentLevel.value - 1)
  }
}

const getClickableObjects = (): THREE.Object3D[] => {
  const list: THREE.Object3D[] = []
  mapGroup?.traverse((obj: THREE.Object3D) => {
    if (obj.userData?.feature) list.push(obj)
  })
  return list
}

/** 根据当前悬停的省份更新所有省份的填充高亮 */
const updateProvinceHighlight = () => {
  const hover = hoverFeature.value
  const highlightAdcode = hover?.properties?.adcode ?? null
  mapGroup?.traverse((obj: THREE.Object3D) => {
    if (obj instanceof THREE.Mesh && obj.material && !Array.isArray(obj.material)) {
      const feature = (obj as THREE.Mesh & { userData: { feature?: GeoFeature } }).userData?.feature
      const mat = obj.material as THREE.MeshLambertMaterial
      mat.color.setHex(feature?.properties?.adcode === highlightAdcode ? FILL_COLOR_HIGHLIGHT : FILL_COLOR_NORMAL)
    }
  })
}

/** 只认地图顶面（z≈MAP_DEPTH）的相交，避免斜视时射线先打到侧面导致高亮错位 */
const pickTopFaceIntersect = (intersects: THREE.Intersection[]): THREE.Intersection | null => {
  const topZ = MAP_DEPTH
  const tolerance = 0.02
  for (const hit of intersects) {
    if (hit.point.z >= topZ - tolerance) return hit
  }
  return null
}

/**
 * 将指针事件坐标转为 Three.js NDC（-1~1）。
 * 仅用 canvas.getBoundingClientRect()，且 setPixelRatio(1)，保证显示区与视口一致、无 DPI 错位。
 */
const pointerToNDC = (canvas: HTMLCanvasElement, event: PointerEvent): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect()
  const w = rect.width || 1
  const h = rect.height || 1
  const x = ((event.clientX - rect.left) / w) * 2 - 1
  const y = -((event.clientY - rect.top) / h) * 2 + 1
  return { x, y }
}

const onPointerMove = (event: PointerEvent) => {
  if (!canvasRef.value || !renderer || !camera) return
  const canvas = canvasRef.value
  const ndc = pointerToNDC(canvas, event)
  mouse.set(ndc.x, ndc.y)
  raycaster.setFromCamera(mouse, camera)
  const objects = getClickableObjects()
  const intersects = raycaster.intersectObjects(objects)
  const first = pickTopFaceIntersect(intersects)
  if (first) {
    const feature = (first.object as THREE.Object3D & { userData: { feature: GeoFeature } }).userData?.feature
    hoverFeature.value = feature ?? null
    canvasRef.value.style.cursor = feature && LEVEL_MAP[feature.properties.adcode] ? 'pointer' : 'default'
  } else {
    hoverFeature.value = null
    canvasRef.value.style.cursor = 'default'
  }
  updateProvinceHighlight()
}

const onPointerClick = () => {
  if (!hoverFeature.value) return
  const adcode = hoverFeature.value.properties.adcode
  const nextJson = LEVEL_MAP[adcode]
  if (currentLevel.value === 0 && nextJson) {
    showLevel(1, adcode)
  } else if (currentLevel.value === 1 && nextJson) {
    showLevel(2, adcode)
  }
}

const initThree = () => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const width = canvas.clientWidth || container.clientWidth
  const height = canvas.clientHeight || container.clientHeight
  const aspect = width / height

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a1628)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
  dirLight.position.set(0.8, 0.6, 1.2)
  dirLight.target.position.set(0, 0, 0)
  scene.add(dirLight)
  scene.add(dirLight.target)
  const fillLight = new THREE.DirectionalLight(0x6b9ed4, 0.25)
  fillLight.position.set(-0.5, -0.3, 0.8)
  fillLight.target.position.set(0, 0, 0)
  scene.add(fillLight)
  scene.add(fillLight.target)

  camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000)
  camera.position.set(0.35, 0.3, 1.2)
  camera.lookAt(0, 0, 0.03)
  camera.updateProjectionMatrix()

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(1)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0.03)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minZoom = 0.3
  controls.maxZoom = 8
  controls.enablePan = true

  raycaster = new THREE.Raycaster()
  raycaster.params.Line.threshold = 0.002
  mouse = new THREE.Vector2()

  css2dRenderer = new CSS2DRenderer()
  css2dRenderer.setSize(width, height)
  css2dRenderer.domElement.style.position = 'absolute'
  css2dRenderer.domElement.style.top = '0'
  css2dRenderer.domElement.style.left = '0'
  css2dRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(css2dRenderer.domElement)

  onPointerLeave = () => {
    hoverFeature.value = null
    updateProvinceHighlight()
  }
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('click', onPointerClick)
}

const resize = () => {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas || !camera || !renderer) return
  const width = canvas.clientWidth || container.clientWidth
  const height = canvas.clientHeight || container.clientHeight
  const aspect = width / height
  camera.left = -aspect
  camera.right = aspect
  camera.top = 1
  camera.bottom = -1
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(1)
  css2dRenderer?.setSize(width, height)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls?.update()
  renderer?.render(scene!, camera!)
  css2dRenderer?.render(scene!, camera!)
}

onMounted(async () => {
  initThree()
  await showLevel(0)
  animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  canvasRef.value?.removeEventListener('pointermove', onPointerMove)
  if (onPointerLeave) canvasRef.value?.removeEventListener('pointerleave', onPointerLeave)
  canvasRef.value?.removeEventListener('click', onPointerClick)
  cancelAnimationFrame(animationId)
  controls?.dispose()
  clearMap()
  if (css2dRenderer?.domElement?.parentNode) {
    css2dRenderer.domElement.parentNode.removeChild(css2dRenderer.domElement)
  }
  css2dRenderer = null
  renderer?.dispose()
})
</script>

<style>
.station-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: pointer;
}

.station-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s;
  /* Removed absolute positioning and z-index as they are handled by parent/wrapper */
}

.station-item:hover .station-marker {
  transform: scale(1.5);
}

.station-item:hover {
  z-index: 100;
}

.station-name {
  margin-top: 4px;
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}

.station-marker.online {
  background-color: #52c41a;
  box-shadow: 0 0 8px #52c41a;
}

.station-marker.offline {
  background-color: #ff4d4f;
  box-shadow: 0 0 8px #ff4d4f;
}
</style>

<style scoped>
.three-map-wrap {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a1628;
}

.top-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background: rgba(10, 22, 40, 0.95);
  border-bottom: 1px solid rgba(61, 122, 181, 0.3);
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
}

.stat-value {
  font-size: 14px;
}
.stat-value.online {
  color: #52c41a;
  margin-right: 8px;
}
.stat-value.offline {
  color: rgba(255, 255, 255, 0.45);
}

.stat-num {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.stat-scope {
  margin-left: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.map-container {
  flex: 1;
  position: relative;
  min-height: 0;
}

.map-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.breadcrumb {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(10, 22, 40, 0.85);
  border-radius: 8px;
  border: 1px solid rgba(61, 122, 181, 0.4);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.breadcrumb .crumb {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
}
.breadcrumb .crumb:hover {
  color: #69b1ff;
}
.breadcrumb .crumb.active {
  color: #fff;
  cursor: default;
}
.breadcrumb .separator {
  color: rgba(255, 255, 255, 0.4);
  user-select: none;
}

.legend {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  gap: 16px;
  padding: 8px 14px;
  background: rgba(10, 22, 40, 0.85);
  border-radius: 8px;
  border: 1px solid rgba(61, 122, 181, 0.3);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.legend .dot.online {
  background: #52c41a;
}
.legend .dot.offline {
  background: rgba(255, 255, 255, 0.45);
}

.back-btn {
  position: absolute;
  top: 16px;
  right: 24px;
  padding: 8px 16px;
  background: rgba(10, 22, 40, 0.85);
  border-radius: 8px;
  border: 1px solid rgba(61, 122, 181, 0.4);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  z-index: 10;
}

.back-btn:hover {
  color: #69b1ff;
  border-color: #69b1ff;
}

/* 全国地图上仅显示有站点省份的站点数（数字） */
.province-label {
  text-align: center;
  white-space: nowrap;
  font-weight: 600;
  font-size: 14px;
  color: #69b1ff;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
}
</style>
