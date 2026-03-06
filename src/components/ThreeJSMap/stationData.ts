/**
 * 四川省站点模拟数据
 * 全国地图仅展示站点总数；点击四川省进入下一级后可看到本层级统计
 */

export interface Station {
  id: string
  name: string
  /** 城市 adcode，如 510100 成都 */
  cityAdcode: number
  /** 经度 */
  lng: number
  /** 纬度 */
  lat: number
  /** 是否在线 */
  online: boolean
}

/** 四川省 adcode */
export const SICHUAN_ADCODE = 510000
/** 成都市 adcode */
export const CHENGDU_ADCODE = 510100

/** 模拟的四川省站点列表（按城市分布） */
export const SICHUAN_STATIONS: Station[] = [
  // 成都市 510100 - 12 个
  { id: 'SC-CD-01', name: '成都龙泉驿站', cityAdcode: 510100, lng: 104.27, lat: 30.56, online: true },
  { id: 'SC-CD-02', name: '成都双流站', cityAdcode: 510100, lng: 103.92, lat: 30.58, online: true },
  { id: 'SC-CD-03', name: '成都郫都站', cityAdcode: 510100, lng: 103.88, lat: 30.80, online: false },
  { id: 'SC-CD-04', name: '成都新都站', cityAdcode: 510100, lng: 104.16, lat: 30.82, online: true },
  { id: 'SC-CD-05', name: '成都温江站', cityAdcode: 510100, lng: 103.86, lat: 30.69, online: true },
  { id: 'SC-CD-06', name: '成都青白江站', cityAdcode: 510100, lng: 104.25, lat: 30.88, online: true },
  { id: 'SC-CD-07', name: '成都都江堰站', cityAdcode: 510100, lng: 103.62, lat: 31.00, online: false },
  { id: 'SC-CD-08', name: '成都彭州站', cityAdcode: 510100, lng: 103.94, lat: 31.16, online: true },
  { id: 'SC-CD-09', name: '成都邛崃站', cityAdcode: 510100, lng: 103.46, lat: 30.41, online: true },
  { id: 'SC-CD-10', name: '成都崇州站', cityAdcode: 510100, lng: 103.67, lat: 30.63, online: true },
  { id: 'SC-CD-11', name: '成都金堂站', cityAdcode: 510100, lng: 104.41, lat: 30.86, online: false },
  { id: 'SC-CD-12', name: '成都大邑站', cityAdcode: 510100, lng: 103.52, lat: 30.59, online: true },
  // 绵阳市 510700 - 5 个
  { id: 'SC-MY-01', name: '绵阳涪城站', cityAdcode: 510700, lng: 104.76, lat: 31.47, online: true },
  { id: 'SC-MY-02', name: '绵阳游仙站', cityAdcode: 510700, lng: 104.77, lat: 31.47, online: true },
  { id: 'SC-MY-03', name: '绵阳江油站', cityAdcode: 510700, lng: 104.75, lat: 31.78, online: false },
  { id: 'SC-MY-04', name: '绵阳三台站', cityAdcode: 510700, lng: 105.09, lat: 31.10, online: true },
  { id: 'SC-MY-05', name: '绵阳梓潼站', cityAdcode: 510700, lng: 105.16, lat: 31.64, online: true },
  // 德阳市 510600 - 4 个
  { id: 'SC-DY-01', name: '德阳旌阳站', cityAdcode: 510600, lng: 104.40, lat: 31.13, online: true },
  { id: 'SC-DY-02', name: '德阳广汉站', cityAdcode: 510600, lng: 104.28, lat: 30.99, online: false },
  { id: 'SC-DY-03', name: '德阳什邡站', cityAdcode: 510600, lng: 104.17, lat: 31.13, online: true },
  { id: 'SC-DY-04', name: '德阳绵竹站', cityAdcode: 510600, lng: 104.22, lat: 31.34, online: true },
  // 宜宾市 511500 - 2 个
  { id: 'SC-YB-01', name: '宜宾翠屏站', cityAdcode: 511500, lng: 104.62, lat: 28.77, online: true },
  { id: 'SC-YB-02', name: '宜宾南溪站', cityAdcode: 511500, lng: 104.97, lat: 28.85, online: true },
]

/**
 * 按省份筛选站点（当前仅有四川省数据）
 */
export function getStationsByProvince(provinceAdcode: number): Station[] {
  if (provinceAdcode !== SICHUAN_ADCODE) return []
  return SICHUAN_STATIONS
}

/**
 * 获取指定省份的总站点数目（全国地图按省展示用）
 */
export function getProvinceStationCount(provinceAdcode: number): number {
  return getStationsByProvince(provinceAdcode).length
}

/**
 * 按城市筛选站点
 */
export function getStationsByCity(cityAdcode: number): Station[] {
  return SICHUAN_STATIONS.filter((s) => s.cityAdcode === cityAdcode)
}

/**
 * 获取指定城市的总站点数目
 */
export function getCityStationCount(cityAdcode: number): Station[] {
  return getStationsByCity(cityAdcode)
}

/**
 * 按层级与 adcode 筛选当前视图的站点
 * level 0 全国 -> 四川省站点
 * level 1 省份 -> 该省站点（此处即四川）
 * level 2 城市 -> 该市站点
 */
export function getStationsForLevel(
  level: number,
  provinceAdcode?: number,
  cityAdcode?: number
): Station[] {
  if (level === 0) return getStationsByProvince(SICHUAN_ADCODE)
  if (level === 1 && provinceAdcode === SICHUAN_ADCODE) return SICHUAN_STATIONS
  if (level === 2 && cityAdcode) return getStationsByCity(cityAdcode)
  return []
}

/** 全国当前有数据的站点总数（仅四川省有数据） */
export function getNationalTotalCount(): { total: number; online: number; offline: number } {
  const list = SICHUAN_STATIONS
  const online = list.filter((s) => s.online).length
  return { total: list.length, online, offline: list.length - online }
}
