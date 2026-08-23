import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, Wallet, CreditCard, PiggyBank, AlertTriangle,
  Loader2, CheckCircle2, HelpCircle, ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCollection } from '@/hooks/useCollection'
import { formatVND, cn } from '@/lib/utils'

const toneMap = {
  primary: { text: 'text-primary', bg: 'bg-primary/15', bar: 'bg-primary' },
  info: { text: 'text-info', bg: 'bg-info/15', bar: 'bg-info' },
  warning: { text: 'text-warning', bg: 'bg-warning/15', bar: 'bg-warning' },
  success: { text: 'text-success', bg: 'bg-success/15', bar: 'bg-success' },
}

const urgentTone = {
  destructive: 'text-destructive bg-destructive/15',
  warning: 'text-warning bg-warning/15',
  success: 'text-success bg-success/15',
  info: 'text-info bg-info/15',
}

const chartTooltip = {
  contentStyle: { background: 'hsl(222 40% 8%)', border: '1px solid hsl(217 33% 15%)', borderRadius: 12, color: '#fff' },
}

const CAT_COLOR = {
  'Xây dựng': 'hsl(221 83% 53%)', 'Thiết bị': 'hsl(160 84% 39%)', 'Bàn ghế': 'hsl(38 92% 50%)',
  'Biển hiệu': 'hsl(262 83% 66%)', 'Marketing': 'hsl(330 81% 60%)', 'Khác': 'hsl(215 20% 45%)',
}

function fmtDay(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) } catch { return '—' }
}

export default function Dashboard() {
  const { rows: tasks, loading: lt } = useCollection('checklist_tasks')
  const { rows: items } = useCollection('budget_items')
  const { rows: txs } = useCollection('budget_transactions')
  const { rows: decisions } = useCollection('decisions')
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

  const pendingDecisions = useMemo(() => decisions.filter((d) => d.status === 'pending'), [decisions])

  const statsCards = [
    { title: 'TIẾN ĐỘ SETUP', value: `${taskStat.pct}%`, percent: taskStat.pct, sub: `${taskStat.done} / ${taskStat.total} công việc`, icon: TrendingUp, tone: 'primary' },
    { title: 'NGÂN SÁCH', value: formatVND(budgetTotal), percent: 100, sub: 'Tổng ngân sách dự kiến', icon: Wallet, tone: 'info' },
    { title: 'ĐÃ CHI', value: formatVND(spent), percent: Math.min(spentPct, 100), sub: `${spentPct}% ngân sách`, icon: CreditCard, tone: 'warning' },
    { title: 'CÒN LẠI', value: formatVND(remaining), percent: Math.max(100 - spentPct, 0), sub: `${100 - spentPct}% ngân sách còn lại`, icon: PiggyBank, tone: 'success' },
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
    { name: 'Hoàn thành', value: taskStat.done, color: 'hsl(160 84% 39%)' },
    { name: 'Đang làm', value: taskStat.doing, color: 'hsl(38 92% 50%)' },
    { name: 'Quá hạn', value: taskStat.overdue, color: 'hsl(0 72% 58%)' },
    { name: 'Chưa làm', value: taskStat.todo, color: 'hsl(215 20% 40%)' },
  ].filter((s) => s.value > 0)), [taskStat])
  const progressTotal = setupProgress.reduce((s, i) => s + i.value, 0)

  const urgentTasks = [
    { title: 'Việc cần xử lý', count: taskStat.overdue, subtitle: 'Quá hạn', icon: AlertTriangle, tone: 'destructive' },
    { title: 'Đang thực hiện', count: taskStat.doing, subtitle: 'Trong tiến độ', icon: Loader2, tone: 'warning' },
    { title: 'Hoàn thành', count: taskStat.done, subtitle: 'Công việc', icon: CheckCircle2, tone: 'success' },
    { title: 'Chờ quyết định', count: pendingDecisions.length, subtitle: 'Khoản/việc', icon: HelpCircle, tone: 'info' },
  ]

  const todoItems = useMemo(() => tasks
    .filter((t) => t.status !== 'done' && t.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4), [tasks])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display text-foreground md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tổng quan tiến độ và tình hình chuẩn bị mở quán</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          const t = toneMap[stat.tone]
          return (
            <Card key={stat.title} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.title}</span>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', t.bg)}>
                    <Icon className={cn('h-4 w-4', t.text)} />
                  </div>
                </div>
                <div className="mt-3 text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className={cn('h-full rounded-full transition-all duration-500', t.bar)} style={{ width: `${stat.percent}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dự toán vs Thực chi (triệu đ)</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" />Dự toán</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-success" />Thực chi</span>
            </div>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu ngân sách</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 15%)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(215 20% 60%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(215 20% 60%)" fontSize={12} tickLine={false} axisLine={false} unit="M" />
                  <Tooltip {...chartTooltip} cursor={{ fill: 'hsl(217 33% 15% / 0.4)' }} formatter={(v) => `${v}M`} />
                  <Bar dataKey="Dự toán" fill="hsl(221 83% 53%)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Thực chi" fill="hsl(160 84% 39%)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ công việc</CardTitle>
          </CardHeader>
          <CardContent>
            {progressTotal === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">Chưa có công việc</div>
            ) : (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={setupProgress} cx="50%" cy="50%" innerRadius={58} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {setupProgress.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip {...chartTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{taskStat.pct}%</span>
                    <span className="text-xs text-muted-foreground">hoàn tất</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  {setupProgress.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="flex-1 text-muted-foreground">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                      <span className="text-xs text-muted-foreground">({Math.round((item.value / progressTotal) * 100)}%)</span>
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
          return (
            <Card key={task.title}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', urgentTone[task.tone])}>
                  <Icon className="h-5 w-5" />
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

      {/* Bottom lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Việc quan trọng</CardTitle>
            <Link to="/checklist" className="flex items-center gap-1 text-sm text-primary hover:underline">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {lt ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : todoItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Không có công việc cần làm.</p>
            ) : todoItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/50">
                <span className={cn('h-2 w-2 shrink-0 rounded-full', item.status === 'overdue' ? 'bg-destructive' : item.status === 'doing' ? 'bg-warning' : 'bg-muted-foreground')} />
                <span className="flex-1 text-sm text-foreground">{item.title}</span>
                <Badge variant={item.status === 'overdue' ? 'destructive' : 'warning'}>Hạn: {fmtDay(item.deadline)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Chờ quyết định</CardTitle>
            <Link to="/decisions" className="flex items-center gap-1 text-sm text-primary hover:underline">Xem tất cả <ArrowRight className="h-3.5 w-3.5" /></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingDecisions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Không có quyết định nào đang chờ.</p>
            ) : pendingDecisions.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/50">
                <HelpCircle className="h-4 w-4 shrink-0 text-info" />
                <span className="flex-1 text-sm text-foreground">{item.title}</span>
                <Badge variant="muted">Chờ</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
