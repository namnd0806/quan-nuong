import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { X, Calendar, Download } from 'lucide-react'
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
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-2xl text-foreground">Báo cáo Food Cost</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>

            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> 01/08/2026 – 22/08/2026
              </span>
              <Button variant="secondary" size="sm"><Download className="h-4 w-4" /> Xuất báo cáo</Button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpisData.map((k) => (
                  <div key={k.label} className="rounded-xl border border-border bg-secondary/30 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</div>
                    <div className={cn('mt-1.5 text-xl font-bold text-foreground', k.tone)}>{k.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Distribution + overview */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phân bổ Food Cost theo danh mục</h3>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width={110} height={110}>
                      <PieChart>
                        <Pie data={distributionData} cx="50%" cy="50%" innerRadius={34} outerRadius={52} paddingAngle={2} dataKey="value" stroke="none">
                          {distributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'hsl(222 47% 11%)', border: '1px solid hsl(217 33% 22%)', borderRadius: 12, color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#cbd5e1' }} formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1">
                      {distributionData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5 text-xs">
                          <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                          <span className="flex-1 text-muted-foreground">{d.name}</span>
                          <span className="font-medium text-foreground">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng quan món ăn</h3>
                  <div className="space-y-2">
                    {overviewData.map((o) => (
                      <div key={o.label} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{o.label}</span>
                        <span className="font-medium text-foreground">{o.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top over-target */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top món vượt mục tiêu</h3>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="p-3 font-semibold">Món ăn</th>
                        <th className="p-3 font-semibold">Danh mục</th>
                        <th className="p-3 font-semibold">Food cost</th>
                        <th className="p-3 font-semibold">Mục tiêu</th>
                        <th className="p-3 font-semibold">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topOverData.map((t) => (
                        <tr key={t.name} className="border-b border-border/60 last:border-0">
                          <td className="p-3 font-medium text-foreground">{t.name}</td>
                          <td className="p-3 text-muted-foreground">{t.cat}</td>
                          <td className="p-3 font-medium text-destructive">{t.fc}</td>
                          <td className="p-3 text-muted-foreground">≤ {t.target || 30}%</td>
                          <td className="p-3 font-medium text-destructive">{t.diff}</td>
                        </tr>
                      ))}
                      {topOverData.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Không có món nào vượt mục tiêu 🎉</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
