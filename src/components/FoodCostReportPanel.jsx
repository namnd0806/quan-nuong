import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Calendar, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatVND, cn } from '@/lib/utils'

const chartTooltip = {
  contentStyle: {
    background: 'rgba(10, 22, 40, 0.95)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    color: '#f8fafc',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
  },
  itemStyle: { color: '#f8fafc' },
}

export default function FoodCostReportPanel({ open, onClose, data }) {
  if (!data) return null

  const { kpis = [], distribution = [], overview = [], topOver = [], foodCostTarget = 30 } = data

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl overflow-y-auto border-white/10" style={{ background: 'linear-gradient(145deg, rgba(10,20,35,0.98), rgba(5,15,30,0.98))', maxHeight: '90vh' }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
              Báo cáo Food Cost
            </DialogTitle>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Download className="h-4 w-4" /> Xuất PDF
            </Button>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6">
            {/* Period */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Kỳ báo cáo: Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/10 p-4" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
                  <div className="text-xs font-medium uppercase tracking-wider text-gray-400">{kpi.label}</div>
                  <div className={cn('mt-2 text-2xl font-bold', kpi.tone || 'text-foreground')}>{kpi.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <div className="rounded-2xl border border-white/10 p-5" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Phân bổ giá vốn theo danh mục</h3>
                {distribution.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-gray-400">Chưa có dữ liệu</div>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={180} height={180}>
                      <PieChart>
                        <Pie data={distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                          {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip {...chartTooltip} formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {distribution.map((d) => (
                        <div key={d.name} className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                            <span className="text-gray-300">{d.name}</span>
                          </div>
                          <span className="font-semibold text-foreground">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Overview */}
              <div className="rounded-2xl border border-white/10 p-5" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Tổng quan</h3>
                <div className="space-y-3">
                  {overview.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className="text-lg font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top over target */}
            <div className="rounded-2xl border border-white/10 p-5" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Top món vượt mục tiêu</h3>
                <span className="text-xs text-gray-500">Mục tiêu: ≤ {foodCostTarget}%</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-400">
                      <th className="p-3 font-semibold">Món ăn</th>
                      <th className="p-3 font-semibold">Danh mục</th>
                      <th className="p-3 font-semibold">Food cost</th>
                      <th className="p-3 font-semibold">Mục tiêu</th>
                      <th className="p-3 font-semibold">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOver.map((t) => (
                      <tr key={t.name} className="border-b border-white/5 last:border-0">
                        <td className="p-3 font-medium text-foreground">{t.name}</td>
                        <td className="p-3 text-gray-400">{t.cat}</td>
                        <td className="p-3 font-semibold text-red-400">{t.fc}</td>
                        <td className="p-3 text-gray-400">≤ {t.target || 30}%</td>
                        <td className="p-3 font-semibold text-red-400">{t.diff}</td>
                      </tr>
                    ))}
                    {topOver.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">
                        <div className="text-4xl">🎉</div>
                        <div className="mt-2">Không có món nào vượt mục tiêu</div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
