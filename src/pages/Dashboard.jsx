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
  Circle, Wrench, UtensilsCrossed, Snowflake, Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCollection } from '@/hooks/useCollection'
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
  labelStyle: { color: 'rgba(148, 163, 184, 1)', fontWeight: 600, marginBottom: 4 },
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

  const budgetAlerts = useMemo(() => {
    const byItem = {}
    for (const t of txs) byItem[t.item_id] = (byItem[t.item_id] || 0) + (t.amount || 0)
    return items
      .map((it) => ({ ...it, actual: byItem[it.id] || 0, ratio: it.planned ? (byItem[it.id] || 0) / it.planned : 0 }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 4)
  }, [items, txs])

  const statsCards = [
    {
      title: 'TIẾN ĐỘ SETUP',
      value: `${taskStat.pct}%`,
      sub: `${taskStat.done} / ${taskStat.total} công việc`,
      trend: '+5% tuần này',
      icon: Target,
      gradient: 'from-blue-500/20 to-blue-600/5',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconBorder: 'rgba(59, 130, 246, 0.3)',
      textColor: 'text-blue-400',
    },
    {
      title: 'NGÂN SÁCH',
      value: formatVND(budgetTotal),
      sub: 'Tổng ngân sách dự kiến',
      trend: `${spentPct}% ngân sách`,
      icon: Wallet,
      gradient: 'from-purple-500/20 to-purple-600/5',
      iconBg: 'rgba(168, 85, 247, 0.15)',
      iconBorder: 'rgba(168, 85, 247, 0.3)',
      textColor: 'text-purple-400',
    },
    {
      title: 'ĐÃ CHI',
      value: formatVND(spent),
      sub: 'Đã chi tiêu',
      trend: `${spentPct}% ngân sách`,
      icon: CreditCard,
      gradient: 'from-orange-500/20 to-amber-600/5',
      iconBg: 'rgba(251, 146, 60, 0.15)',
      iconBorder: 'rgba(251, 146, 60, 0.3)',
      textColor: 'text-orange-400',
    },
    {
      title: 'CÒN LẠI',
      value: formatVND(remaining),
      sub: 'Còn lại ngân sách',
      trend: `${100 - spentPct}% còn lại`,
      icon: PiggyBank,
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      iconBg: 'rgba(52, 211, 153, 0.15)',
      iconBorder: 'rgba(52, 211, 153, 0.3)',
      textColor: 'text-emerald-400',
    },
  ]

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
    { name: 'Hoàn thành', value: taskStat.done, fill: '#34D399' },
    { name: 'Đang làm', value: taskStat.doing, fill: '#FB923C' },
    { name: 'Chưa làm', value: taskStat.todo, fill: '#A78BFA' },
  ].filter((s) => s.value > 0)), [taskStat])

  const progressTotal = setupProgress.reduce((s, i) => s + i.value, 0)

  const radialData = useMemo(() => setupProgress.map((s) => ({
    name: s.name,
    value: progressTotal ? Math.round((s.value / progressTotal) * 100) : 0,
    fill: s.fill,
    count: s.value,
  })), [setupProgress, progressTotal])

  const urgentTasks = [
    { title: 'Việc cần xử lý', count: taskStat.overdue, subtitle: 'Quá hạn', icon: AlertTriangle, bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.3)', text: 'text-red-400' },
    { title: 'Đang thực hiện', count: taskStat.doing, subtitle: 'Trong tiến độ', icon: Loader2, bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)', text: 'text-orange-400' },
    { title: 'Hoàn thành', count: taskStat.done, subtitle: 'Công việc', icon: CheckCircle2, bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)', text: 'text-emerald-400' },
    { title: 'Chưa làm', count: taskStat.todo, subtitle: 'Công việc', icon: ListTodo, bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: 'text-purple-400' },
  ]

  const todoItems = useMemo(() => tasks
    .filter((t) => t.status !== 'done' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4), [tasks])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Tổng quan tiến độ và tình hình chuẩn bị mở quán</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-white/20 hover:shadow-2xl" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
                <div className={cn('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-40', stat.gradient)} />
                <CardContent className="relative p-6">
                  {/* Icon at top */}
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                    style={{ background: stat.iconBg, border: `1px solid ${stat.iconBorder}` }}
                  >
                    <Icon className={cn('h-5 w-5', stat.textColor)} />
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{stat.title}</div>
                    <div className="mt-2 text-3xl font-bold leading-tight text-foreground">{stat.value}</div>
                    <div className="mt-1 text-xs text-gray-400">{stat.sub}</div>
                  </div>

                  {/* Badge at bottom */}
                  {stat.trend && (
                    <div className="mt-4">
                      <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium', stat.textColor)} style={{ background: stat.iconBg }}>
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-300">XU HƯỚNG NGÂN SÁCH THEO HẠNG MỤC</CardTitle>
            <div className="flex shrink-0 items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-gray-400">Ngân sách</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-gray-400">Đã chi</span>
              </span>
              <span className="hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 sm:inline">Đơn vị: Triệu đồng</span>
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
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(148,163,184,0.6)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(148,163,184,0.6)" fontSize={11} tickLine={false} axisLine={false} unit="M" />
                  <Tooltip {...chartTooltip} cursor={{ stroke: 'rgba(59,130,246,0.3)', strokeDasharray: '4 4' }} formatter={(v) => `${v}M`} />
                  <Area type="monotone" dataKey="Ngân sách" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gPlan)" />
                  <Area type="monotone" dataKey="Đã chi" stroke="#34D399" strokeWidth={2.5} fill="url(#gActual)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-300">TỔNG TIẾN ĐỘ CÔNG VIỆC</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {progressTotal === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Chưa có công việc</div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <ResponsiveContainer width={160} height={160}>
                    <RadialBarChart data={radialData} innerRadius="55%" outerRadius="100%" startAngle={90} endAngle={-270} barSize={12}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" background={{ fill: 'rgba(255,255,255,0.05)' }} cornerRadius={8} />
                      <Tooltip {...chartTooltip} formatter={(v, _n, p) => [`${p?.payload?.count} · ${v}%`, p?.payload?.name]} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{taskStat.pct}%</span>
                    <span className="text-xs text-gray-400">Hoàn tất</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5">
                  {radialData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.fill }} />
                        <span className="text-sm text-gray-300">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-foreground">{item.count}</span>
                        <span className="text-xs text-gray-500">({item.value}%)</span>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/checklist"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Xem chi tiết <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Urgent Pills */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {urgentTasks.map((task, i) => {
          const Icon = task.icon
          return (
            <motion.div
              key={task.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="rounded-2xl border transition-all hover:scale-105" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.5), rgba(10,22,40,0.7))', borderColor: task.border }}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: task.bg, border: `1.5px solid ${task.border}` }}>
                      <Icon className={cn('h-6 w-6', task.text)} />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground">{task.count}</div>
                      <div className="text-xs font-semibold text-gray-300">{task.title}</div>
                      <div className="text-[10px] text-gray-500">{task.subtitle}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-300">VIỆC QUAN TRỌNG</CardTitle>
            <Link to="/checklist" className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {lt ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : todoItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Không có công việc cần làm.</p>
            ) : (
              <div className="space-y-4">
                {todoItems.map((item, idx) => {
                  const statusColor = item.status === 'overdue' ? 'bg-red-500' : item.status === 'doing' ? 'bg-orange-500' : 'bg-blue-500'
                  const statusLabel = item.status === 'overdue' ? 'Quá hạn' : 'Đang làm'
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-white/10 hover:bg-white/10"
                    >
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', statusColor)} />
                      <span className="flex-1 text-sm font-medium text-foreground">{item.title}</span>
                      <span className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-gray-400">
                        Hạn: {fmtDay(item.deadline)}
                      </span>
                      {item.status !== 'todo' && (
                        <span className={cn('shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold', item.status === 'overdue' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400')}>
                          {statusLabel}
                        </span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-white/10" style={{ background: 'linear-gradient(145deg, rgba(15,30,50,0.6), rgba(10,22,40,0.8))' }}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-300">
              <AlertTriangle className="h-4 w-4 text-red-400" /> CẢNH BÁO NGÂN SÁCH
            </CardTitle>
            <Link to="/budget" className="flex items-center gap-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-5">
            {budgetAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có hạng mục ngân sách.</p>
            ) : budgetAlerts.map((item, idx) => {
              const pct = Math.round(item.ratio * 100)
              const color = pct >= 100 ? '#EF4444' : pct >= 70 ? '#FB923C' : '#34D399'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{item.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">{formatVND(item.actual)} / {formatVND(item.planned)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span
                      className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                      style={{ background: `${color}20`, color }}
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
