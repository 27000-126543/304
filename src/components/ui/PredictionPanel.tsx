import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { TrendingUp, Clock, Truck, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function PredictionPanel() {
  const { predictionData } = useStore()
  const [holidayFactor, setHolidayFactor] = useState(1.0)

  const chartData = useMemo(
    () => predictionData.map(d => ({
      ...d,
      predicted: Math.round(d.predicted * holidayFactor),
    })),
    [predictionData, holidayFactor]
  )

  const totalVolume = useMemo(
    () => chartData.reduce((sum, d) => sum + d.predicted, 0),
    [chartData]
  )

  const peakHour = useMemo(() => {
    const max = chartData.reduce((m, d) => d.predicted > m.predicted ? d : m, chartData[0])
    return max?.hour ?? '08:00'
  }, [chartData])

  const recommendedVehicles = useMemo(
    () => Math.max(2, Math.ceil(totalVolume / 3000)),
    [totalVolume]
  )

  const currentHour = new Date().getHours()

  return (
    <div className="bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">24h预测</span>
      </div>

      <div className="p-2">
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#42a5f5" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#42a5f5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2a4a" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9, fill: '#6b7c93' }}
              interval={3}
              axisLine={{ stroke: '#1a2a4a' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: '#6b7c93' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: '#0f1f3d',
                border: '1px solid #1a2a4a',
                borderRadius: 4,
                fontSize: 10,
                color: '#e0e8f0',
              }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#42a5f5"
              strokeWidth={1.5}
              fill="url(#predGrad)"
            />
            {currentHour >= 0 && currentHour < 24 && (
              <ReferenceLine
                x={`${String(currentHour).padStart(2, '0')}:00`}
                stroke="#00e5a0"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-[#0a1628]/60 rounded p-1.5 text-center">
            <div className="text-[10px] text-[#6b7c93] flex items-center justify-center gap-0.5">
              <BarChart3 className="w-2.5 h-2.5" />预测总量
            </div>
            <div className="font-mono text-xs text-[#e0e8f0]">{totalVolume.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a1628]/60 rounded p-1.5 text-center">
            <div className="text-[10px] text-[#6b7c93] flex items-center justify-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />峰值时段
            </div>
            <div className="font-mono text-xs text-[#ffc107]">{peakHour}</div>
          </div>
          <div className="bg-[#0a1628]/60 rounded p-1.5 text-center">
            <div className="text-[10px] text-[#6b7c93] flex items-center justify-center gap-0.5">
              <Truck className="w-2.5 h-2.5" />建议车辆
            </div>
            <div className="font-mono text-xs text-[#00e5a0]">{recommendedVehicles}</div>
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#6b7c93] flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />假日系数
            </span>
            <span className="font-mono text-[#e0e8f0]">{holidayFactor.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={2.0}
            step={0.1}
            value={holidayFactor}
            onChange={e => setHolidayFactor(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#1a2a4a] rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00e5a0]
              [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
