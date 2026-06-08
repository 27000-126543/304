import type { GarbageBin, GarbageTruck, CompressionBox, Personnel, User, DailyReport } from '@/types'

export const initialBins: GarbageBin[] = [
  { id: 'B-001', position: [-12, 0, -8], location: '翠苑小区A栋', type: 'residential', fillLevel: 45, countdown: 180, status: 'normal' },
  { id: 'B-002', position: [-8, 0, -12], location: '翠苑小区B栋', type: 'residential', fillLevel: 82, countdown: 45, status: 'warning' },
  { id: 'B-003', position: [-4, 0, -6], location: '翠苑小区C栋', type: 'residential', fillLevel: 96, countdown: 5, status: 'critical' },
  { id: 'B-004', position: [4, 0, -10], location: '阳光花园D栋', type: 'residential', fillLevel: 33, countdown: 240, status: 'normal' },
  { id: 'B-005', position: [8, 0, -6], location: '阳光花园E栋', type: 'residential', fillLevel: 88, countdown: 30, status: 'warning' },
  { id: 'B-006', position: [14, 0, -4], location: '阳光花园F栋', type: 'residential', fillLevel: 55, countdown: 120, status: 'normal' },
  { id: 'B-007', position: [-14, 0, 4], location: '和平小区1栋', type: 'residential', fillLevel: 72, countdown: 60, status: 'normal' },
  { id: 'B-008', position: [-10, 0, 8], location: '和平小区2栋', type: 'residential', fillLevel: 97, countdown: 2, status: 'critical' },
  { id: 'B-009', position: [-6, 0, 12], location: '和平小区3栋', type: 'residential', fillLevel: 15, countdown: 300, status: 'normal' },
  { id: 'B-010', position: [6, 0, 10], location: '锦绣花园A栋', type: 'residential', fillLevel: 68, countdown: 90, status: 'normal' },
  { id: 'B-011', position: [10, 0, 14], location: '锦绣花园B栋', type: 'residential', fillLevel: 91, countdown: 15, status: 'critical' },
  { id: 'B-012', position: [16, 0, 8], location: '锦绣花园C栋', type: 'residential', fillLevel: 42, countdown: 200, status: 'normal' },
  { id: 'K-001', position: [-6, 0, 0], location: '中心大道1号', type: 'roadside', fillLevel: 60, countdown: 100, status: 'normal' },
  { id: 'K-002', position: [0, 0, -2], location: '中心大道2号', type: 'roadside', fillLevel: 85, countdown: 35, status: 'warning' },
  { id: 'K-003', position: [6, 0, 0], location: '中心大道3号', type: 'roadside', fillLevel: 28, countdown: 260, status: 'normal' },
  { id: 'K-004', position: [-2, 0, 6], location: '人民路1号', type: 'roadside', fillLevel: 75, countdown: 70, status: 'normal' },
  { id: 'K-005', position: [2, 0, 6], location: '人民路2号', type: 'roadside', fillLevel: 50, countdown: 150, status: 'normal' },
]

export const initialTrucks: GarbageTruck[] = [
  {
    id: 'T-001', position: [0, 0, 2], currentLoad: 2400, maxLoad: 5000,
    route: [[0, 0, 2], [-4, 0, -6], [-8, 0, -12], [-12, 0, -8]],
    status: 'collecting', speed: 0.02, routeProgress: 0.3, targetBinId: 'B-003'
  },
  {
    id: 'T-002', position: [8, 0, 0], currentLoad: 1200, maxLoad: 5000,
    route: [[8, 0, 0], [8, 0, -6], [4, 0, -10]],
    status: 'collecting', speed: 0.015, routeProgress: 0.5, targetBinId: 'B-005'
  },
  {
    id: 'T-003', position: [-10, 0, 4], currentLoad: 0, maxLoad: 5000,
    route: [], status: 'idle', speed: 0, routeProgress: 0, targetBinId: null
  },
  {
    id: 'T-004', position: [20, 0, 0], currentLoad: 3800, maxLoad: 5000,
    route: [[20, 0, 0], [16, 0, 8], [10, 0, 14]],
    status: 'collecting', speed: 0.018, routeProgress: 0.2, targetBinId: 'B-011'
  },
]

export const initialCompressionBoxes: CompressionBox[] = [
  { id: 'CB-001', stationName: '城东中转站', position: [22, 0, -12], liquidLevel: 75, temperature: 38, sprinklerActive: false, status: 'normal' },
  { id: 'CB-002', stationName: '城东中转站', position: [26, 0, -12], liquidLevel: 92, temperature: 42, sprinklerActive: false, status: 'high_level' },
  { id: 'CB-003', stationName: '城西中转站', position: [-22, 0, -8], liquidLevel: 55, temperature: 65, sprinklerActive: true, status: 'temp_alarm' },
  { id: 'CB-004', stationName: '城西中转站', position: [-22, 0, -4], liquidLevel: 40, temperature: 36, sprinklerActive: false, status: 'normal' },
]

export const initialPersonnel: Personnel[] = [
  { id: 'P-001', name: '张伟', jobType: '操作工', position: [22, 0, -10], currentZone: 'compression', isAlarm: false },
  { id: 'P-002', name: '李明', jobType: '维修工', position: [-22, 0, -6], currentZone: 'compression', isAlarm: true },
  { id: 'P-003', name: '王芳', jobType: '调度员', position: [0, 0, 0], currentZone: 'dispatch', isAlarm: false },
  { id: 'P-004', name: '赵刚', jobType: '驾驶员', position: [5, 0, 2], currentZone: 'road', isAlarm: false },
  { id: 'P-005', name: '刘洋', jobType: '操作工', position: [26, 0, -10], currentZone: 'compression', isAlarm: false },
]

export const initialUsers: User[] = [
  { id: 'U-001', name: '张伟', role: 'driver', avatar: '', lastLogin: '2026-06-08 08:30:00', assignedTruckId: 'T-001' },
  { id: 'U-002', name: '王芳', role: 'dispatcher', avatar: '', lastLogin: '2026-06-08 07:45:00' },
  { id: 'U-003', name: '陈局长', role: 'bureau_leader', avatar: '', lastLogin: '2026-06-07 17:20:00' },
  { id: 'U-004', name: '李明', role: 'driver', avatar: '', lastLogin: '2026-06-08 06:15:00', assignedTruckId: 'T-002' },
  { id: 'U-005', name: '赵站长', role: 'dispatcher', avatar: '', lastLogin: '2026-06-08 08:00:00' },
]

export const generateDailyReports = (): DailyReport[] => {
  const areas = ['翠苑小区', '阳光花园', '和平小区', '锦绣花园', '中心大道', '人民路']
  const reports: DailyReport[] = []
  for (let d = 7; d >= 0; d--) {
    const date = new Date(2026, 5, 8 - d)
    const dateStr = date.toISOString().split('T')[0]
    for (const area of areas) {
      reports.push({
        date: dateStr,
        area,
        collectionVolume: Math.round(800 + Math.random() * 1200),
        vehicleUtilization: Math.round(55 + Math.random() * 35),
        equipmentFailures: Math.round(Math.random() * 3),
        complaints: Math.round(Math.random() * 5),
      })
    }
  }
  return reports
}

export const predictionData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  predicted: Math.round(200 + Math.sin((i - 6) / 24 * Math.PI * 2) * 300 + Math.random() * 100),
  actual: i <= new Date().getHours() ? Math.round(200 + Math.sin((i - 6) / 24 * Math.PI * 2) * 300 + Math.random() * 100) : undefined,
  holidayFactor: 1.0,
}))
