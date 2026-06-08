import { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { Download, TrendingUp, Truck, AlertTriangle, MessageSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import TopBar from '@/components/ui/TopBar'
import { useStore } from '@/store/useStore'

export default function Report() {
  const dailyReports = useStore(s => s.dailyReports)
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))

  const filteredReports = useMemo(() => {
    return dailyReports.filter(r => r.date >= startDate && r.date <= endDate)
  }, [dailyReports, startDate, endDate])

  const summary = useMemo(() => {
    const totalVolume = filteredReports.reduce((s, r) => s + r.collectionVolume, 0)
    const avgUtilization = filteredReports.length
      ? Math.round(filteredReports.reduce((s, r) => s + r.vehicleUtilization, 0) / filteredReports.length)
      : 0
    const totalFailures = filteredReports.reduce((s, r) => s + r.equipmentFailures, 0)
    const totalComplaints = filteredReports.reduce((s, r) => s + r.complaints, 0)
    return { totalVolume, avgUtilization, totalFailures, totalComplaints }
  }, [filteredReports])

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; volume: number; utilization: number }>()
    for (const r of filteredReports) {
      const existing = byDate.get(r.date)
      if (existing) {
        existing.volume += r.collectionVolume
        existing.utilization = Math.round((existing.utilization + r.vehicleUtilization) / 2)
      } else {
        byDate.set(r.date, { date: r.date, volume: r.collectionVolume, utilization: r.vehicleUtilization })
      }
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredReports])

  const handleExport = () => {
    const exportData = filteredReports.map(r => ({
      '日期': r.date,
      '区域': r.area,
      '收运量(吨)': r.collectionVolume,
      '车辆利用率(%)': r.vehicleUtilization,
      '设备故障(次)': r.equipmentFailures,
      '投诉(次)': r.complaints,
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, '收运报表')

    const summaryWs = XLSX.utils.json_to_sheet([{
      '总收运量(吨)': summary.totalVolume,
      '平均车辆利用率(%)': summary.avgUtilization,
      '总设备故障(次)': summary.totalFailures,
      '总投诉(次)': summary.totalComplaints,
    }])
    XLSX.utils.book_append_sheet(wb, summaryWs, '汇总')

    XLSX.writeFile(wb, `收运报表_${startDate}_${endDate}.xlsx`)
  }

  const summaryCards = [
    { label: '总收运量', value: `${summary.totalVolume} 吨`, icon: TrendingUp, color: 'text-cyber-accent' },
    { label: '平均车辆利用率', value: `${summary.avgUtilization}%`, icon: Truck, color: 'text-blue-400' },
    { label: '设备故障总数', value: `${summary.totalFailures} 次`, icon: AlertTriangle, color: 'text-cyber-warning' },
    { label: '投诉总数', value: `${summary.totalComplaints} 次`, icon: MessageSquare, color: 'text-cyber-danger' },
  ]

  return (
    <div className="flex h-screen flex-col bg-cyber-bg overflow-hidden">
      <TopBar />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="panel-bg rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-cyber-text-dim">起始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="rounded-md border border-cyber-border bg-cyber-secondary px-3 py-1.5 text-sm text-cyber-text focus:border-cyber-accent focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-cyber-text-dim">结束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="rounded-md border border-cyber-border bg-cyber-secondary px-3 py-1.5 text-sm text-cyber-text focus:border-cyber-accent focus:outline-none"
              />
            </div>
            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-2 rounded-md bg-cyber-accent/20 px-4 py-1.5 text-sm text-cyber-accent border border-cyber-accent/30 transition-colors hover:bg-cyber-accent/30"
            >
              <Download className="h-4 w-4" />
              导出Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {summaryCards.map(card => (
            <div key={card.label} className="panel-bg rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-secondary">
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <div className="text-xs text-cyber-text-dim">{card.label}</div>
                  <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel-bg rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-cyber-accent mb-4">收运量趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7c93', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: '#6b7c93', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7c93', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(13,26,48,0.95)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="volume" name="收运量(吨)" fill="#00e5a0" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="utilization" name="利用率(%)" fill="#42a5f5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-bg rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-cyber-border">
            <h3 className="text-sm font-medium text-cyber-accent">日报明细</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyber-border">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-cyber-text-dim">日期</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-cyber-text-dim">区域</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-cyber-text-dim">收运量(吨)</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-cyber-text-dim">车辆利用率</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-cyber-text-dim">设备故障</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-cyber-text-dim">投诉</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r, i) => (
                  <tr
                    key={`${r.date}-${r.area}`}
                    className="border-b border-cyber-border/50 transition-colors hover:bg-cyber-secondary/30"
                    style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(15,31,61,0.3)' }}
                  >
                    <td className="px-4 py-2 text-cyber-text-dim font-mono text-xs">{r.date}</td>
                    <td className="px-4 py-2 text-cyber-text">{r.area}</td>
                    <td className="px-4 py-2 text-right font-mono text-cyber-accent">{r.collectionVolume}</td>
                    <td className="px-4 py-2 text-right font-mono">
                      <span className={r.vehicleUtilization >= 80 ? 'text-cyber-accent' : r.vehicleUtilization >= 60 ? 'text-cyber-warning' : 'text-cyber-danger'}>
                        {r.vehicleUtilization}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      <span className={r.equipmentFailures > 0 ? 'text-cyber-warning' : 'text-cyber-text-dim'}>
                        {r.equipmentFailures}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      <span className={r.complaints > 0 ? 'text-cyber-danger' : 'text-cyber-text-dim'}>
                        {r.complaints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
