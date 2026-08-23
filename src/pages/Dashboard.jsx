import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'
import {
  TrendingUp, Wallet, CreditCard, PiggyBank, AlertTriangle,
  Loader2, CheckCircle2, ListTodo, ArrowRight, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCollection } from '@/hooks/useCollection'
import { formatVND, cn } from '@/lib/utils'

// Bảng màu accent (dạng "H S% L%") để dùng cho gradient + glow
const TONE = {
  primary: { hsl: '221 83% 53%', text: 'text-primary' },
  info: { hsl: '262 83% 66%', text: 'text-info' },
  warning: { hsl: '38 92% 50%', text: 'text-warning' },
  success: { hsl: '160 84% 39%', text: 'text-success' },
  destructive: { hsl: '0 72% 58%', text: 'text-destructive' },
}

const chartTooltip = {
  contentStyle: { background: 'hsl(222 47% 11%)', border: '1px solid hsl(217 33% 22%)', borderRadius: 12, color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' },
  itemStyle: { color: '#f8fafc' },
  labelStyle: { color: '#cbd5e1', fontWeight: 600, marginBottom: 4 },
}

function fmtDay(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) } catch { return '—' }
}

// Vòng tròn tiến độ nhỏ (SVG) cho các thẻ Bento
function MiniRing({ percent, hsl }) {
  const r = 20
  const c = 2 * Math.PI * r
  const p = Math.max(0, Math.min(100, percent))
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0 -rotate-90">
      <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" stroke={`hsl(${hsl} / 0.14)`} />
      <motion.circle
        cx="26" cy="26" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
        stroke={`hsl(${hsl})`} strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (c * p) / 100 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function Dashboard() {
  const { rows: tasks, loading: lt } = useCollection('checklist_tasks')
  const { rows: items } = useCollection('budget_items')
  const { rows: txs } = useCollection('budget_transactions')
  const { rows: settingsRows } = useCollection('settings', { orderBy: 'id', ascending: true, realtime: false })

  const budgetTotal = settingsRows[0]?.budget_total || 500000000

  const taskStat = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length
    const doing = tasks.filter((t) => t.status === 'doing').length
    const overdue = tasks.filter((t) => t.status === 'overdue').length
    const todo = tasks.filter((t) => t.status === 'todo').length
    const total = tasks.length
    const pct = total ? Math.round((done / total) * 100) : 0
    return { done, doing, overdue, todo, total, pct }
  }, [tasks])

  const spent = useMemo(() => txs.reduce((s, t) => s + (t.amount || 0), 0), [txs])
  const remaining = budgetTotal - spent
  const spentPct = budgetTotal ? Math.round((spent / budgetTotal) * 100) : 0

  // Hạng mục có tỉ lệ chi cao nhất (cảnh báo ngân sách)
  const budgetAlerts = useMemo(() => {
    const byItem = {}
    for (const t of txs) byItem[t.item_id] = (byItem[t.item_id] || 0) + (t.amount || 0)
    return items
      .map((it) => ({ ...it, actual: byItem[it.id] || 0, ratio: it.planned ? (byItem[it.id] || 0) / it.planned : 0 }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 4)
  }, [items, txs])

  const statsCards = [
    { title: 'TIẾN ĐỘ SETUP', value: `${taskStat.pct}%`, percent: taskStat.pct, sub: `${taskStat.done} / ${taskStat.total} công việc`, icon: TrendingUp, tone: 'primary' },
    { title: 'NGÂN SÁCH', value: formatVND(budgetTotal), percent: 100, sub: 'Tổng ngân sách dự kiến', icon: Wallet, tone: 'info' },
    { title: 'ĐÃ CHI', value: formatVND(spent), percent: Math.min(spentPct, 100), sub: `${spentPct}% ngân sách`, icon: CreditCard, tone: 'warning' },
    { title: 'CÒN LẠI', value: formatVND(remaining), percent: Math.max(100 - spentPct, 0), sub: `${100 - spentPct}% còn lại`, icon: PiggyBank, tone: 'success' },
  ]

  // Dự toán vs Thực chi theo hạng mục
  const revenueData = useMemo(() => {
    const map = {}
    for (const it of items) {
      const c = it.category || 'Khác'
      map[c] ||= { name: c, 'Dự toán': 0, 'Thực chi': 0 }
      map[c]['Dự toán'] += it.planned || 0
    }
    const byItem = {}
    for (const t of txs) byItem[t.item_id] = (byItem[t.item_id] || 0) + (t.amount || 0)
    for (const it of items) {
      const c = it.category || 'Khác'
      if (map[c]) map[c]['Thực chi'] += byItem[it.id] || 0
    }
    return Object.values(map).map((r) => ({ name: r.name, 'Dự toán': Math.round(r['Dự toán'] / 1e6), 'Thực chi': Math.round(r['Thực chi'] / 1e6) }))
  }, [items, txs])

  const setupProgress = useMemo(() => ([
    { name: 'Hoàn thành', value: taskStat.done, hsl: '160 84% 39%' },
    { name: 'Đang làm', value: taskStat.doing, hsl: '38 92% 50%' },
    { name: 'Quá hạn', value: taskStat.overdue, hsl: '0 72% 58%' },
    { name: 'Chưa làm', value: taskStat.todo, hsl: '215 20% 40%' },
  ].filter((s) => s.value > 0)), [taskStat])
  const progressTotal = setupProgress.reduce((s, i) => s + i.value, 0)

  // Dữ liệu multi-ring radial: mỗi hạng mục là 1 vòng đồng tâm (giá trị = % trên tổng)
  const radialData = useMemo(() => setupProgress.map((s) => ({
    name: s.name,
    value: progressTotal ? Math.round((s.value / progressTotal) * 100) : 0,
    fill: `hsl(${s.hsl})`,
    count: s.value,
  })), [setupProgress, progressTotal])

  const urgentTasks = [
    { title: 'Việc cần xử lý', count: taskStat.overdue, subtitle: 'Quá hạn', icon: AlertTriangle, tone: 'destructive' },
    { title: 'Đang thực hiện', count: taskStat.doing, subtitle: 'Trong tiến độ', icon: Loader2, tone: 'warning' },
    { title: 'Hoàn thành', count: taskStat.done, subtitle: 'Công việc', icon: CheckCircle2, tone: 'success' },
    { title: 'Chưa làm', count: taskStat.todo, subtitle: 'Công việc', icon: ListTodo, tone: 'info' },
  ]

  const todoItems = useMemo(() => tasks
    .filter((t) => t.status !== 'done' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4), [tasks])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display text-foreground md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tổng quan tiến độ và tình hình chuẩn bị mở quán</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Đồng bộ realtime
        </span>
      </div>

      {/* Bento stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon
          const tn = TONE[stat.tone]
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="group relative overflow-hidden rounded-2xl border-border/60">
                {/* gradient rất nhẹ + glow accent */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{ background: `radial-gradient(120% 90% at 100% 0%, hsl(${tn.hsl} / 0.12), transparent 60%)` }}
                />
                <div
                  className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-80"
                  style={{ background: `hsl(${tn.hsl} / 0.18)` }}
                />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.title}</span>
                      <div className="mt-3 truncate text-2xl font-bold text-foreground">{stat.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
                    </div>
                    <div className="relative grid place-items-center">
                      <MiniRing percent={stat.percent} hsl={tn.hsl} />
                      <Icon className={cn('absolute h-4 w-4', tn.text)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row: Area trend + multi-ring radial */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border-border/60 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Xu hướng ngân sách theo hạng mục</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" />Dự toán</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" />Thực chi</span>
              <span className="hidden rounded-md border border-border/70 bg-secondary/40 px-2 py-1 sm:inline">Đơn vị: Triệu đồng</span>
            </div>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu ngân sách</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(221 83% 53%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 15%)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(215 20% 60%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 60%)" fontSize={12} tickLine={false} axisLine={false} unit="M" />
                  <Tooltip {...chartTooltip} cursor={{ stroke: 'hsl(217 33% 30%)', strokeDasharray: '4 4' }} formatter={(v) => `${v}M`} />
                  <Area type="monotone" dataKey="Dự toán" stroke="hsl(221 83% 53%)" strokeWidth={2.5} fill="url(#gPlan)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="Thực chi" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#gActual)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader>
            <CardTitle>Tổng tiến độ công việc</CardTitle>
          </CardHeader>
          <CardContent>
            {progressTotal === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">Chưa có công việc</div>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart data={radialData} innerRadius="42%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={9}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" background={{ fill: 'hsl(217 33% 15%)' }} cornerRadius={8} />
                      <Tooltip {...chartTooltip} formatter={(v, _n, p) => [`${p?.payload?.count} việc · ${v}%`, p?.payload?.name]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{taskStat.pct}%</span>
                    <span className="text-xs text-muted-foreground">hoàn tất</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  {radialData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.fill }} />
                      <span className="flex-1 text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.count}</span>
                      <span className="text-xs text-muted-foreground">({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Urgent stat pills */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {urgentTasks.map((task) => {
          const Icon = task.icon
          const tn = TONE[task.tone]
          return (
            <Card key={task.title} className="group relative overflow-hidden rounded-2xl border-border/60">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{ background: `radial-gradient(120% 100% at 0% 0%, hsl(${tn.hsl} / 0.12), transparent 55%)` }}
              />
              <CardContent className="relative flex items-center gap-4 p-5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `hsl(${tn.hsl} / 0.15)`, boxShadow: `0 0 0 1px hsl(${tn.hsl} / 0.25) inset` }}
                >
                  <Icon className={cn('h-5 w-5', tn.text)} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{task.count}</div>
                  <div className="text-sm font-medium text-foreground">{task.title}</div>
                  <div className="text-xs text-muted-foreground">{task.subtitle}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bottom: vertical timeline + progress monitoring panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Việc quan trọng</CardTitle>
            <Link to="/checklist" className="flex items-center gap-1 text-sm text-primary hover:underline">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardHeader>
          <CardContent>
            {lt ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : todoItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Không có công việc cần làm.</p>
            ) : (
              <ol className="relative ml-2 space-y-5 border-l border-border/70 pl-6">
                {todoItems.map((item) => {
                  const tone = item.status === 'overdue' ? 'destructive' : item.status === 'doing' ? 'warning' : 'info'
                  const tn = TONE[tone]
                  return (
                    <li key={item.id} className="relative">
                      <span
                        className="absolute -left-[31px] top-0.5 grid h-4 w-4 place-items-center rounded-full ring-4 ring-background"
                        style={{ background: `hsl(${tn.hsl})` }}
                      />
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm leading-snug text-foreground">{item.title}</span>
                        <span
                          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{ background: `hsl(${tn.hsl} / 0.15)`, color: `hsl(${tn.hsl})` }}
                        >
                          <Clock className="h-3 w-3" /> {fmtDay(item.deadline)}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.status === 'overdue' ? 'Quá hạn' : item.status === 'doing' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning" /> Cảnh báo ngân sách</CardTitle>
            <Link to="/budget" className="flex items-center gap-1 text-sm text-primary hover:underline">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetAlerts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Chưa có hạng mục ngân sách.</p>
            ) : budgetAlerts.map((item) => {
              const pct = Math.round(item.ratio * 100)
              const over = item.actual > item.planned
              const tone = over || pct >= 100 ? 'destructive' : pct >= 60 ? 'warning' : 'success'
              const tn = TONE[tone]
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatVND(item.actual)} / {formatVND(item.planned)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `hsl(${tn.hsl})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span
                      className="w-12 shrink-0 rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold"
                      style={{ background: `hsl(${tn.hsl} / 0.15)`, color: `hsl(${tn.hsl})` }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
