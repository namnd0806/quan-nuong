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
  Circle, Wrench, UtensilsCrossed, Snowflake,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCollection } from '@/hooks/useCollection'
import { formatVND, cn } from '@/lib/utils'

// Bảng màu accent (dạng "H S% L%") để dùng cho gradient + glow
const TONE = {
  primary: { hsl: '217 91% 60%', text: 'text-blue-400' },
  info: { hsl: '280 85% 55%', text: 'text-purple-400' },
  warning: { hsl: '39 89% 55%', text: 'text-amber-400' },
  success: { hsl: '160 84% 39%', text: 'text-emerald-400' },
  destructive: { hsl: '0 84% 60%', text: 'text-red-400' },
}

const chartTooltip = {
  contentStyle: { background: 'hsl(218 44% 7%)', border: '1px solid hsl(215 20% 65% / 0.1)', borderRadius: 12, color: '#f8fafc', boxShadow: '0 16px 40px rgba(0,0,0,0.35)' },
  itemStyle: { color: '#f8fafc' },
  labelStyle: { color: 'hsl(215 20% 65%)', fontWeight: 600, marginBottom: 4 },
}

function fmtDay(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) } catch { return '—' }
}

function getTaskIcon(title) {
  const map = {
    'nền': Circle,
    'hút': Wrench,
    'nướng': UtensilsCrossed,
    'đông': Snowflake,
  }
  for (const [key, icon] of Object.entries(map)) {
    if (title.toLowerCase().includes(key)) return icon
  }
  return ListTodo
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
    { title: 'TIẾN ĐỘ SETUP', value: `${taskStat.pct}%`, percent: taskStat.pct, sub: `${taskStat.done} / ${taskStat.total} công việc`, trend: '+5% tuần này', icon: TrendingUp, tone: 'primary' },
    { title: 'NGÂN SÁCH', value: formatVND(budgetTotal), percent: 100, sub: 'Tổng ngân sách dự kiến', trend: `${spentPct}% ngân sách`, icon: Wallet, tone: 'info' },
    { title: 'ĐÃ CHI', value: formatVND(spent), percent: Math.min(spentPct, 100), sub: 'Đã chi tiêu', trend: `${spentPct}% ngân sách`, icon: CreditCard, tone: 'warning' },
    { title: 'CÒN LẠI', value: formatVND(remaining), percent: Math.max(100 - spentPct, 0), sub: 'Còn lại ngân sách', trend: `${100 - spentPct}% còn lại`, icon: PiggyBank, tone: 'success' },
  ]

  // Dự toán vs Thực chi theo hạng mục — order theo target: Xây dựng, Thiết bị, Nội thất, Marketing, Nguyên liệu
  const revenueData = useMemo(() => {
    const order = ['Xây dựng', 'Thiết bị', 'Nội thất', 'Marketing', 'Nguyên liệu']
    const map = {}
    for (const it of items) {
      const c = it.category || 'Khác'
      map[c] ||= { name: c, 'Ngân sách': 0, 'Đã chi': 0 }
      map[c]['Ngân sách'] += it.planned || 0
    }
    const byItem = {}
    for (const t of txs) byItem[t.item_id] = (byItem[t.item_id] || 0) + (t.amount || 0)
    for (const it of items) {
      const c = it.category || 'Khác'
      if (map[c]) map[c]['Đã chi'] += byItem[it.id] || 0
    }
    const arr = Object.values(map).map((r) => ({
      name: r.name,
      'Ngân sách': Math.round(r['Ngân sách'] / 1e6),
      'Đã chi': Math.round(r['Đã chi'] / 1e6)
    }))
    return arr.sort((a, b) => {
      const ia = order.indexOf(a.name), ib = order.indexOf(b.name)
      if (ia >= 0 && ib >= 0) return ia - ib
      if (ia >= 0) return -1
      if (ib >= 0) return 1
      return a.name.localeCompare(b.name)
    })
  }, [items, txs])

  const setupProgress = useMemo(() => ([
    { name: 'Hoàn thành', value: taskStat.done, hsl: '160 84% 39%' },
    { name: 'Đang làm', value: taskStat.doing, hsl: '38 92% 50%' },
    { name: 'Chưa làm', value: taskStat.todo, hsl: '258 90% 66%' },
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
      {/* Header với status chip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-tight text-foreground">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Tổng quan tiến độ và tình hình chuẩn bị mở quán</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-muted/50 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          <span>Đồng bộ realtime</span>
        </div>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon
          const tn = TONE[stat.tone]
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="surface surface-hover group relative overflow-hidden rounded-2xl border border-muted/20">
                {/* Gradient background subtle per tone */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{ background: `radial-gradient(circle at 0% 0%, hsl(${tn.hsl} / 0.3), transparent 60%)` }}
                />
                {/* Top gradient line */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${tn.hsl} / 0.5), transparent)` }}
                />
                <CardContent className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `hsl(${tn.hsl} / 0.18)`, border: `1px solid hsl(${tn.hsl} / 0.35)` }}
                    >
                      <Icon className={cn('h-5 w-5', tn.text)} />
                    </div>
                    <MiniRing percent={stat.percent} hsl={tn.hsl} />
                  </div>
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">{stat.title}</span>
                    <div className="mt-1 truncate text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</div>
                  </div>
                  {stat.trend && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: `hsl(${tn.hsl})` }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${tn.hsl})` }} />
                      {stat.trend}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts row: Area trend + multi-ring radial */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="surface rounded-2xl border border-muted/20">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="text-sm font-semibold">XU HƯỚNG NGÂN SÁCH THEO HẠNG MỤC</CardTitle>
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(217 91% 60%)' }} /> Ngân sách</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(160 84% 39%)' }} /> Đã chi</span>
              <span className="hidden rounded-md border border-border/70 bg-muted/40 px-2 py-1 sm:inline text-[11px]">Đơn vị: Triệu đồng</span>
            </div>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu ngân sách</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPlan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 65% / 0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(215 20% 50%)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 50%)" fontSize={11} tickLine={false} axisLine={false} unit="M" />
                  <Tooltip {...chartTooltip} cursor={{ stroke: 'hsl(217 91% 60% / 0.25)', strokeDasharray: '4 4' }} formatter={(v) => `${v}M`} />
                  <Area type="monotone" dataKey="Ngân sách" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#gPlan)" dot={false} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="Đã chi" stroke="hsl(160 84% 39%)" strokeWidth={2.5} fill="url(#gActual)" dot={false} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="surface rounded-2xl border border-muted/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">TỔNG TIẾN ĐỘ CÔNG VIỆC</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {progressTotal === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có công việc</div>
            ) : (
              <>
                <div className="flex items-start gap-6">
                  {/* Radial chart bên trái */}
                  <div className="flex-1 relative">
                    <ResponsiveContainer width="100%" height={180}>
                      <RadialBarChart data={radialData} innerRadius="45%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={12}>
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" background={{ fill: 'hsl(215 20% 65% / 0.1)' }} cornerRadius={8} />
                        <Tooltip {...chartTooltip} formatter={(v, _n, p) => [`${p?.payload?.count} · ${v}%`, p?.payload?.name]} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">{taskStat.pct}%</span>
                      <span className="text-[10px] text-muted-foreground">hoàn tất</span>
                    </div>
                  </div>
                  {/* Legend bên phải */}
                  <div className="space-y-2">
                    {radialData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-[12px]">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: item.fill }} />
                        <span className="text-muted-foreground flex-1">{item.name}</span>
                        <span className="font-semibold text-foreground">{item.count}</span>
                        <span className="text-muted-foreground">({item.value}%)</span>
                      </div>
                    ))}
                  </div>
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
            <motion.div
              key={task.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="surface group relative overflow-hidden rounded-2xl transition-all duration-200 border border-muted/20 hover:border-muted/30">
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{ background: `radial-gradient(circle at 50% 0%, hsl(${tn.hsl} / 0.25), transparent 75%)` }}
                />
                <CardContent className="relative p-5">
                  <div className="flex flex-col gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `hsl(${tn.hsl} / 0.2)`, border: `1.5px solid hsl(${tn.hsl} / 0.5)` }}
                    >
                      <Icon className={cn('h-6 w-6', tn.text)} />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">{task.count}</div>
                      <div className="mt-1 text-xs font-semibold leading-tight text-foreground">{task.title}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{task.subtitle}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom: vertical timeline + progress monitoring panel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2" style={{ alignItems: 'stretch' }}>
        <Card className="surface rounded-2xl border border-muted/20">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">VIỆC QUAN TRỌNG</CardTitle>
            <Link to="/checklist" className="flex items-center gap-1 text-xs text-primary hover:underline">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
          </CardHeader>
          <CardContent>
            {lt ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : todoItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Không có công việc cần làm.</p>
            ) : (
              <ol className="relative ml-1 space-y-6 border-l border-muted/30 pl-7">
                {todoItems.map((item, idx) => {
                  const tone = item.status === 'overdue' ? 'destructive' : item.status === 'doing' ? 'warning' : 'info'
                  const tn = TONE[tone]
                  const TaskIcon = getTaskIcon(item.title)
                  return (
                    <motion.li
                      key={item.id}
                      className="relative"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.05 }}
                    >
                      <span
                        className="absolute -left-[15px] top-1 h-5 w-5 rounded-full ring-4 ring-background transition-all duration-300 hover:scale-110 flex items-center justify-center"
                        style={{ background: `hsl(${tn.hsl})`, boxShadow: `0 0 12px hsl(${tn.hsl} / 0.4)` }}
                      >
                        <TaskIcon className="h-2.5 w-2.5 text-background" />
                      </span>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
                        <span
                          className="shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold"
                          style={{ background: `hsl(${tn.hsl} / 0.12)`, color: `hsl(${tn.hsl})` }}
                        >
                          <Clock className="h-3 w-3" /> Hạn: {fmtDay(item.deadline)}
                        </span>
                      </div>
                    </motion.li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card className="surface rounded-2xl border border-muted/20">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-warning" /> CẢNH BÁO NGÂN SÁCH</CardTitle>
            <Link to="/budget" className="flex items-center gap-1 text-xs text-primary hover:underline">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
          </CardHeader>
          <CardContent className="space-y-5">
            {budgetAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có hạng mục ngân sách.</p>
            ) : budgetAlerts.map((item, idx) => {
              const pct = Math.round(item.ratio * 100)
              const over = item.actual > item.planned
              const tone = over || pct >= 100 ? 'destructive' : pct >= 70 ? 'warning' : 'success'
              const tn = TONE[tone]
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="truncate text-xs font-semibold text-foreground">{item.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatVND(item.actual)} / {formatVND(item.planned)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                      <motion.div
                        className="h-full rounded-full transition-all"
                        style={{ background: `hsl(${tn.hsl})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                    <span
                      className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `hsl(${tn.hsl} / 0.15)`, color: `hsl(${tn.hsl})` }}
                    >
                      {pct}%
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
