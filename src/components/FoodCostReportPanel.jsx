import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Calendar, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatVND, cn } from '@/lib/utils'

const distribution = [
  { name: 'Thịt nướng', value: 35.6, color: 'hsl(221 83% 53%)' },
  { name: 'Hải sản', value: 28.3, color: 'hsl(160 84% 39%)' },
  { name: 'Lẩu', value: 18.7, color: 'hsl(38 92% 50%)' },
  { name: 'Món phụ', value: 8.9, color: 'hsl(262 83% 66%)' },
  { name: 'Đồ uống', value: 5.2, color: 'hsl(330 81% 60%)' },
  { name: 'Tráng miệng', value: 3.3, color: 'hsl(215 20% 50%)' },
]

const topOver = [
  { name: 'Ba chỉ nướng', cat: 'Thịt nướng', fc: '34.23%', diff: '+4.23%' },
  { name: 'Lẩu nấm thập cẩm', cat: 'Lẩu', fc: '34.54%', diff: '+4.54%' },
  { name: 'Cánh gà nướng', cat: 'Thịt nướng', fc: '34.86%', diff: '+4.86%' },
  { name: 'Bia Sài Gòn', cat: 'Đồ uống', fc: '32.00%', diff: '+2.00%' },
]

const kpis = [
  { label: 'Food cost TB', value: '28.45%', sub: 'Mục tiêu: ≤ 30%', tone: 'text-success' },
  { label: 'Tổng doanh thu', value: formatVND(89750000), sub: 'Trong khoảng thời gian' },
  { label: 'Tổng giá vốn', value: formatVND(25520000), sub: 'Trong khoảng thời gian' },
  { label: 'Lợi nhuận gộp', value: formatVND(64230000), sub: '71.50% biên lợi nhuận', tone: 'text-success' },
]

const overview = [
  { label: 'Tổng số món', value: '32' },
  { label: 'Món đạt mục tiêu', value: '24 (75%)' },
  { label: 'Món vượt mục tiêu', value: '8 (25%)' },
  { label: 'Cần kiểm tra', value: '4' },
]

export default function FoodCostReportPanel({ open, onClose, data }) {
  const kpisData = data?.kpis || kpis
  const distributionData = data?.distribution || distribution
  const overviewData = data?.overview || overview
  const topOverData = data?.topOver || topOver
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent maxWidth="5xl" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Báo cáo Food Cost</DialogTitle>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" /> 01/08/2026 – 22/08/2026
              </span>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Download className="h-4 w-4" /> Xuất báo cáo
              </Button>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {kpisData.map((k) => (
                <div key={k.label} className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className={cn('mt-1.5 text-xl font-bold text-foreground', k.tone)}>{k.value}</div>
                  <div className="mt-1 text-xs text-gray-400">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Distribution + overview */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Phân bổ Food Cost theo danh mục</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={110} height={110}>
                    <PieChart>
                      <Pie data={distributionData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} paddingAngle={2} dataKey="value" stroke="none">
                        {distributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1d29', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#cbd5e1' }} formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {distributionData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="flex-1 text-gray-300">{d.name}</span>
                        <span className="font-semibold text-foreground">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Tổng quan món ăn</h3>
                <div className="space-y-2">
                  {overviewData.map((o) => (
                    <div key={o.label} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5 text-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-gray-300">{o.label}</span>
                      <span className="font-semibold text-foreground">{o.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top over-target */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Top món vượt mục tiêu</h3>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-gray-400" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="p-3 font-semibold">Món ăn</th>
                      <th className="p-3 font-semibold">Danh mục</th>
                      <th className="p-3 font-semibold">Food cost</th>
                      <th className="p-3 font-semibold">Mục tiêu</th>
                      <th className="p-3 font-semibold">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'rgba(255,255,255,0.01)' }}>
                    {topOverData.map((t) => (
                      <tr key={t.name} className="border-b border-white/5 last:border-0">
                        <td className="p-3 font-medium text-foreground">{t.name}</td>
                        <td className="p-3 text-gray-400">{t.cat}</td>
                        <td className="p-3 font-semibold text-red-400">{t.fc}</td>
                        <td className="p-3 text-gray-400">≤ {t.target || 30}%</td>
                        <td className="p-3 font-semibold text-red-400">{t.diff}</td>
                      </tr>
                    ))}
                    {topOverData.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-400">Không có món nào vượt mục tiêu 🎉</td></tr>
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
