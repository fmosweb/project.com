"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

// Donut Chart Component
export function DonutChart({ data, total }: { data: { label: string; value: number; color: string }[]; total: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-[200px] animate-pulse bg-gray-100 rounded" />

  const radius = 80
  const strokeWidth = 28
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  let cumulativePercentage = 0

  return (
    <div className="relative flex items-center justify-center h-[200px]">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {data.map((item, index) => {
          const percentage = (item.value / parseFloat(total.replace(/,/g, ''))) * 100
          const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`
          const strokeDashoffset = -(cumulativePercentage * circumference) / 100
          cumulativePercentage += percentage

          return (
            <circle
              key={index}
              stroke={item.color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-700 ease-out"
              style={{ animation: `draw-circle 1s ease-out ${index * 0.1}s both` }}
            />
          )
        })}
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-500">Total</p>
      </div>
    </div>
  )
}

// Multi series Line Chart (Users vs Sales)
export function MultiLineChart({ data, colorUsers = "#3b82f6", colorSales = "#f59e0b" }: { data: { label: string; users: number; sales: number }[]; colorUsers?: string; colorSales?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-[200px] animate-pulse bg-gray-100 rounded" />

  const maxValue = Math.max(1, ...data.map(d => Math.max(d.users || 0, d.sales || 0)))
  const pts = (arr: number[]) => arr.map((v, i) => ({
    x: (i / Math.max(1, (arr.length - 1))) * 100,
    y: 100 - ((v || 0) / maxValue) * 100,
  }))
  const usersPts = pts(data.map(d => d.users || 0))
  const salesPts = pts(data.map(d => d.sales || 0))

  const path = (points: {x:number;y:number}[]) => `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`

  return (
    <div className="relative h-[200px] w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
        ))}

        {/* Sales line */}
        <path d={path(salesPts)} fill="none" stroke={colorSales} strokeWidth="2" />
        {salesPts.map((p, i) => (
          <circle key={`s-${i}`} cx={p.x} cy={p.y} r="1.5" fill={colorSales} />
        ))}

        {/* Users line */}
        <path d={path(usersPts)} fill="none" stroke={colorUsers} strokeWidth="2" />
        {usersPts.map((p, i) => (
          <circle key={`u-${i}`} cx={p.x} cy={p.y} r="1.5" fill={colorUsers} />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
        {data.filter((_, i) => i % 2 === 0).map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )
}


// Line Chart Component  
export function LineChart({ data }: { data: { month: string; value: number }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-[200px] animate-pulse bg-gray-100 rounded" />

  const maxValue = Math.max(...data.map(d => d.value))
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - (item.value / maxValue) * 100
  }))

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
  const areaData = `${pathData} L 100,100 L 0,100 Z`

  return (
    <div className="relative h-[200px] w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
        ))}
        
        {/* Area fill */}
        <path d={areaData} fill="url(#gradient)" opacity="0.3" />
        
        {/* Line */}
        <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth="2" />
        
        {/* Points */}
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="1.5" fill="#f59e0b" />
        ))}
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
        {data.filter((_, i) => i % 2 === 0).map((item) => (
          <span key={item.month}>{item.month}</span>
        ))}
      </div>
    </div>
  )
}

// Mini Stats Card
export function StatsCard({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon,
  color = "amber"
}: { 
  title: string
  value: string | number
  trend?: "up" | "down"
  trendValue?: string
  icon?: React.ReactNode
  color?: string
}) {
  const colorClasses = {
    amber: "from-amber-500 to-orange-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500"
  }

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.amber} bg-opacity-10`}>
              {icon}
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-3xl group-hover:scale-150 transition-transform" />
      </CardContent>
    </Card>
  )
}

// Activity Table Component
export function ActivityTable({ data }: { data: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
            <th className="pb-3 font-semibold">Invoice ID</th>
            <th className="pb-3 font-semibold">Category</th>
            <th className="pb-3 font-semibold">Price</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, index) => (
            <tr key={index} className="group hover:bg-gray-50 transition-colors">
              <td className="py-4 text-sm font-medium text-gray-900">{item.id}</td>
              <td className="py-4 text-sm text-gray-600">{item.category}</td>
              <td className="py-4 text-sm text-gray-900 font-medium">{item.price}</td>
              <td className="py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'In progress' ? 'bg-amber-100 text-amber-800' :
                  item.status === 'Paid' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="py-4 text-right">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

<style jsx global>{`
  @keyframes draw-circle {
    from {
      stroke-dasharray: 0 ${2 * Math.PI * 66};
    }
  }
`}</style>
