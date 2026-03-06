/**
 * 将 GeoJSON FeatureCollection 解析为 Three.js 几何体
 * 坐标系：GeoJSON [lng, lat] -> Three.js 平面 (x, y)，y 轴朝上对应北
 */
import * as THREE from 'three'

export interface GeoFeature {
  type: string
  properties: {
    adcode: number
    name: string
    center?: [number, number]
    centroid?: [number, number]
    level?: string
    parent?: { adcode: number }
    [key: string]: unknown
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][] // Polygon 或 MultiPolygon
  }
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

/** 从 geometry 取出所有环（Polygon 与 MultiPolygon 兼容） */
function getRings(geometry: GeoFeature['geometry']): number[][][] {
  const c = geometry?.coordinates
  if (!c || !Array.isArray(c)) return []
  if (geometry.type === 'MultiPolygon') {
    return (c as number[][][][]).flatMap((poly) => poly)
  }
  if (geometry.type === 'Polygon') {
    return c as number[][][]
  }
  return []
}

/** 从 geometry 取出所有多边形（每个多边形为环数组，首环为外边界） */
function getPolygons(geometry: GeoFeature['geometry']): number[][][][] {
  const c = geometry?.coordinates
  if (!c || !Array.isArray(c)) return []
  if (geometry.type === 'MultiPolygon') {
    return c as number[][][][]
  }
  if (geometry.type === 'Polygon') {
    return [ c as number[][][] ]
  }
  return []
}

function getBBox(features: GeoFeature[]): { minLng: number; maxLng: number; minLat: number; maxLat: number } {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
  features.forEach((f) => {
    const rings = getRings(f.geometry)
    rings.forEach((ring) => {
      if (!Array.isArray(ring)) return
      ring.forEach((pos) => {
        const [lng, lat] = Array.isArray(pos) ? pos : [pos, 0]
        if (typeof lng !== 'number' || typeof lat !== 'number') return
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
      })
    })
  })
  return { minLng, maxLng, minLat, maxLat }
}

function makeTransform(bbox: ReturnType<typeof getBBox>, padding = 0.1) {
  const { minLng, maxLng, minLat, maxLat } = bbox
  const rangeLng = maxLng - minLng || 1
  const rangeLat = maxLat - minLat || 1
  const pad = 1 - padding * 2
  const scale = Math.min(pad / rangeLng, pad / rangeLat)
  const centerLng = (minLng + maxLng) / 2
  const centerLat = (minLat + maxLat) / 2
  return (lng: number, lat: number): [number, number] => {
    const x = (lng - centerLng) * scale
    const y = (lat - centerLat) * scale
    return [x, y]
  }
}

function ringToShape(ring: number[][], transform: (lng: number, lat: number) => [number, number]): THREE.Shape {
  const points = ring.map(([lng, lat]) => transform(lng, lat))
  const shape = new THREE.Shape()
  if (points.length < 2) return shape
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1])
  }
  return shape
}

function createShapeFromMultiPolygon(
  coordinates: number[][][][],
  transform: (lng: number, lat: number) => [number, number]
): THREE.Shape[] {
  const shapes: THREE.Shape[] = []
  for (const polygon of coordinates) {
    if (!polygon?.length) continue
    const exterior = ringToShape(polygon[0], transform)
    for (let i = 1; i < polygon.length; i++) {
      const hole = ringToShape(polygon[i], transform)
      exterior.holes.push(new THREE.Path(hole.getPoints()))
    }
    shapes.push(exterior)
  }
  return shapes
}

/** 用于在地图上放置省份名称/站点数标签的位置 */
export interface LabelPosition {
  feature: GeoFeature
  x: number
  y: number
}

export function createMapMeshFromGeoJSON(
  geojson: GeoJSONCollection,
  options: {
    fillColor?: number
    fillOpacity?: number
    strokeColor?: number
    /** 挤出高度，0 为平面，>0 为立体 */
    depth?: number
  } = {}
): { group: THREE.Group; bbox: ReturnType<typeof getBBox>; meshes: THREE.Mesh[]; labelPositions: LabelPosition[]; transform: (lng: number, lat: number) => [number, number] } {
  const {
    fillColor = 0x1a4a6e,
    fillOpacity = 0.98,
    strokeColor = 0x3d7ab5,
    depth = 0.06
  } = options

  const features = geojson.features || []
  const bbox = getBBox(features)
  const transform = makeTransform(bbox)
  const group = new THREE.Group()
  const meshes: THREE.Mesh[] = []
  const labelPositions: LabelPosition[] = []

  // 立体需要受光材质才能看出明暗
  const material = new THREE.MeshLambertMaterial({
    color: fillColor,
    transparent: true,
    opacity: fillOpacity,
    side: THREE.FrontSide,
    depthWrite: true,
    flatShading: false
  })

  const outlineMaterial = new THREE.LineBasicMaterial({
    color: strokeColor,
    linewidth: 1
  })

  features.forEach((feature) => {
    const polygons = getPolygons(feature.geometry)
    if (!polygons.length) return

    // 省份中心点用于放置名称/站点数标签（优先 centroid，其次 center）
    const center = feature.properties?.centroid ?? feature.properties?.center
    if (center && Array.isArray(center) && center.length >= 2) {
      const [lng, lat] = center as [number, number]
      const [x, y] = transform(lng, lat)
      labelPositions.push({ feature, x, y })
    }

    const shapes = createShapeFromMultiPolygon(polygons, transform)
    shapes.forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false
      })
      const mesh = new THREE.Mesh(geometry, material.clone())
      ;(mesh as THREE.Mesh & { userData: { feature: GeoFeature } }).userData.feature = feature
      group.add(mesh)
      meshes.push(mesh)

      // 立体时在顶面画边界线（顶面 z = depth）
      const points = shape.getPoints()
      if (points.length > 1) {
        const pts = points.map((p) => new THREE.Vector3(p.x, p.y, depth))
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts)
        const line = new THREE.Line(lineGeom, outlineMaterial)
        ;(line as THREE.Line & { userData: { feature: GeoFeature } }).userData.feature = feature
        group.add(line)
      }
    })
  })

  return { group, bbox, meshes, labelPositions, transform }
}
