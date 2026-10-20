import React, { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutList, Table2, Banknote, Plus, Search, ChevronDown, ChevronUp, ChevronRight, Check, Settings2, RefreshCw, Pencil, Trash2, Wallet, Calendar, Loader2, GripVertical, Link as LinkIcon, CloudUpload, ShieldCheck } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase'
import { formatCompactVND, formatVND } from '@/lib/utils'
import { localDate, isOverdue } from '@/lib/data-flow'
import { taskStates, priorities, budgetStates, planningGroups, spendingSummary, paymentTotal, budgetPaymentState, personName, personKey, taskMatches, validMoney } from '@/lib/planning-model'
import { Attachments, PlanningPanel, PlanningNav, GroupIcon, iconSections, Field, Stat, Pill, BusyButton, History } from './PlanningParts'
import './planning.css'

const money = (value) => formatVND(Number(value || 0))
const compact = (value) => formatCompactVND(value)
const date = (value) => value ? value.split('-').reverse().join('/') : 'Chưa đặt hạn'
const emptyRecord = (kind, group = '') => ({ id: crypto.randomUUID(), title: '', group, assignee: '', status: kind === 'tasks' ? 'todo' : 'pending', priority: 'medium', deadline: '', description: '', linked_budget_id: '', attachments: [], planned: '', agreed_amount: '', owner: '', note: '' })

export default function PlanningWorkspace({ kind }) {
  const task = kind === 'tasks'
  const { profile, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tasks = useCollection('checklist_tasks')
  const budgets = useCollection('budget_items')
  const payments = useCollection('budget_transactions', { orderBy: 'spent_at' })
  const categories = useCollection('main_categories', { orderBy: 'sort', ascending: true })
  const members = useCollection('members', { orderBy: 'sort', ascending: true })
  const source = task ? tasks : budgets
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState('all')
  const [state, setState] = useState('all')
  const [quickView, setQuickView] = useState(null)
  const [budgetView, setBudgetView] = useState(null)
  const [layout, setLayout] = useState('groups')
  const [expanded, setExpanded] = useState({})
  const [draft, setDraft] = useState(null)
  const [detailId, setDetailId] = useState(() => task ? null : searchParams.get('item'))
  const [payment, setPayment] = useState(null)
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupDraft, setGroupDraft] = useState(null)
  const [groupOrder, setGroupOrder] = useState([])
  const [draggingGroup, setDraggingGroup] = useState(null)
  const [busy, setBusy] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [sheetSyncing, setSheetSyncing] = useState(false)
  const [sheetConfirmOpen, setSheetConfirmOpen] = useState(false)
  const [sheetSyncResult, setSheetSyncResult] = useState(null)
  const syncLock = useRef(false)
  const groupOrderRef = useRef([])
  const draggedGroupRef = useRef(null)
  const groupOrderChangedRef = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [groupError, setGroupError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [moveToGroup, setMoveToGroup] = useState('')
  const events = useCollection('workspace_events', { filterColumn: 'entity_id', filterValue: draft?.id || detailId || '00000000-0000-0000-0000-000000000000', limit: 100 })

  const me = profile?.name || user?.email?.split('@')[0] || ''
  const groups = useMemo(() => planningGroups(categories.rows, source.rows, kind), [categories.rows, source.rows, kind])
  const allGroups = useMemo(() => {
    const both = planningGroups(categories.rows, tasks.rows, 'tasks')
    for (const g of planningGroups(categories.rows, budgets.rows, 'budget')) if (!both.some((existing) => existing.id === g.id)) both.push(g)
    return both
  }, [categories.rows, tasks.rows, budgets.rows])
  const summary = useMemo(() => spendingSummary(budgets.rows, payments.rows, members.rows), [budgets.rows, payments.rows, members.rows])
  const byItem = useMemo(() => {
    const map = {}
    for (const p of payments.rows) (map[p.item_id] ||= []).push(p)
    return map
  }, [payments.rows])
  const detail = budgets.rows.find((b) => b.id === detailId)
  const detailPayments = byItem[detailId] || []
  const detailActual = paymentTotal(detailPayments)
  const currentHistory = events.rows.filter((e) => e.entity_id === (draft?.id || detailId))
  const selectedHistory = events.rows.filter((e) => e.entity_id === detailId)
  const names = [...new Set([...members.rows.map((m) => m.name), ...(task ? tasks.rows.map((t) => t.assignee) : budgets.rows.map((b) => b.owner))].filter((name) => name && personKey(name) !== personKey('Cả hai')))]
  const stats = { todo: tasks.rows.filter((t) => ['todo','waiting','paused'].includes(t.status)).length, doing: tasks.rows.filter((t) => t.status === 'doing').length, overdue: tasks.rows.filter((t) => isOverdue(t)).length }
  const quickTasks = useMemo(() => {
    if (!task || !quickView) return []
    if (quickView === 'overdue') return tasks.rows.filter((row) => isOverdue(row))
    if (quickView === 'doing') return tasks.rows.filter((row) => row.status === 'doing')
    return tasks.rows.filter((row) => ['todo','waiting','paused'].includes(row.status))
  }, [task, quickView, tasks.rows])
  const quickLabel = { todo: 'Cần làm', doing: 'Đang làm', overdue: 'Quá hạn' }
  const budgetQuickRows = useMemo(() => {
    if (task || !budgetView) return []
    if (budgetView.type === 'person') return payments.rows.filter((row) => !row.voided_at && row.payer_id === budgetView.memberId).sort((a, b) => String(b.spent_at).localeCompare(String(a.spent_at)))
    const rows = budgets.rows.map((row) => ({ ...row, actual: paymentTotal(byItem[row.id] || []) }))
    return budgetView.type === 'actual' ? rows.filter((row) => row.actual > 0) : rows.sort((a, b) => Number(b.planned || 0) - Number(a.planned || 0))
  }, [task, budgetView, payments.rows, budgets.rows, byItem])
  const disabled = busy || uploading
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const refresh = async () => { await Promise.all([tasks.refetch(), budgets.refetch(), payments.refetch(), categories.refetch(), members.refetch(), events.refetch()]) }
  const syncNow = async () => {
    if (syncLock.current) return
    syncLock.current = true
    setSyncing(true)
    setSearch('')
    setScope('all')
    setState('all')
    setExpanded({})
    setQuickView(null)
    setBudgetView(null)
    const collections = [tasks, budgets, payments, categories, members, events]
    const labels = ['công việc', 'ngân sách', 'thanh toán', 'nhóm', 'thành viên', 'lịch sử']
    try {
      const results = await Promise.allSettled(collections.map((collection) => Promise.resolve().then(() => collection.refetch())))
      const failed = results.flatMap((result, index) => result.status === 'rejected' || result.value?.error ? [labels[index]] : [])
      if (failed.length) toast.error(`Chưa tải được ${failed.join(', ')}. Vui lòng thử lại.`)
      else toast.success('Đã đồng bộ dữ liệu mới nhất.')
    } finally {
      syncLock.current = false
      setSyncing(false)
    }
  }
  const syncSheet = async () => {
    if (sheetSyncing) return
    setSheetSyncing(true)
    setSheetSyncResult(null)
    try {
      const { data, error } = await supabase.functions.invoke(task ? 'sync-checklist-sheet' : 'sync-budget-sheet', { body: {} })
      if (error) throw error
      if (!data?.ok) throw new Error(data?.error || 'Google Sheet chưa nhận được dữ liệu.')
      setSheetSyncResult(data)
      setSheetConfirmOpen(false)
      toast.success(`Đã đồng bộ ${data.rows || 0} ${task ? 'công việc' : 'khoản ngân sách'} sang Google Sheet.`)
    } catch (error) {
      let message = error.message || 'Không đồng bộ được Google Sheet. Hãy thử lại.'
      try {
        const body = await error.context?.json()
        if (body?.error) message = body.error
      } catch {
        // Keep the client error when the response body is unavailable.
      }
      toast.error(message)
    } finally {
      setSheetSyncing(false)
    }
  }

  const report = (error) => toast.error(error.message || 'Không thực hiện được. Hãy thử lại.')
  const openNew = (group) => { setFormError(''); setDraft(emptyRecord(kind, group || '')) }
  const openRecord = (row) => {
    if (!task) { setDetailId(row.id); return }
    editRecord(row)
  }
  const editRecord = (row) => {
    setFormError('')
    const group = row.category_id || allGroups.find((g) => g.name === (task ? row.dept : row.category))?.id || ''
    setDraft({ ...emptyRecord(kind), ...row, title: task ? row.title : row.name, group, description: row.description || '', note: row.note || '', deadline: row.deadline || '', linked_budget_id: row.linked_budget_id || '', planned: String(row.planned ?? ''), agreed_amount: row.agreed_amount == null ? '' : String(row.agreed_amount), attachments: row.attachments || [] })
  }
  const saveRecord = async (e) => {
    e.preventDefault()
    if (disabled) return
    setFormError('')
    const group = allGroups.find((g) => g.id === draft.group)
    if (!group) { setFormError('Hãy chọn nhóm hoặc tạo nhóm mới.'); return }
    if (!task && (!validMoney(draft.planned) || (draft.agreed_amount !== '' && !validMoney(draft.agreed_amount)))) { setFormError('Số tiền phải là số nguyên không âm.'); return }
    setBusy(true)
    try {
      const values = { ...draft, title: draft.title.trim(), category_id: group.legacy ? null : group.id, category: group.name }
      if (!task) { values.planned = Number(draft.planned); values.agreed_amount = draft.agreed_amount === '' ? null : Number(draft.agreed_amount) }
      const { error } = await supabase.rpc('save_planning_record', { p_kind: kind, p_id: draft.id, p_values: values, p_expected: draft.updated_at || null })
      if (error) throw error
      await refresh(); setDraft(null); toast.success('Đã lưu thay đổi.')
    } catch (error) { setFormError(error.message) } finally { setBusy(false) }
  }
  const toggleTask = async (row) => {
    if (busy) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('save_planning_record', { p_kind: 'tasks', p_id: row.id, p_expected: row.updated_at, p_values: { ...row, title: row.title, category: row.dept || 'Chưa phân nhóm', status: row.status === 'done' ? 'todo' : 'done' } })
      if (error) throw error
      await tasks.refetch(); await events.refetch()
    } catch (error) { report(error) } finally { setBusy(false) }
  }
  const openGroupManager = () => {
    const order = [...categories.rows]
    groupOrderRef.current = order
    groupOrderChangedRef.current = false
    setGroupOrder(order)
    setGroupDraft({ id: crypto.randomUUID(), name: '', icon: 'folder' })
    setGroupError(''); setGroupOpen(true)
  }
  const moveGroup = (sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return
    const current = groupOrderRef.current
    const from = current.findIndex((group) => group.id === sourceId)
    const to = current.findIndex((group) => group.id === targetId)
    if (from < 0 || to < 0) return
    const next = [...current]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    groupOrderRef.current = next
    groupOrderChangedRef.current = true
    setGroupOrder(next)
  }
  const persistGroupOrder = async (order = groupOrderRef.current) => {
    if (!groupOrderChangedRef.current || busy) return
    setBusy(true); setGroupError('')
    try {
      const { error } = await supabase.rpc('reorder_main_categories', { p_ids: order.map((group) => group.id) })
      if (error) throw error
      groupOrderChangedRef.current = false
      await categories.refetch()
      toast.success('Đã lưu thứ tự nhóm.')
    } catch (error) { setGroupError(error.message); await categories.refetch() } finally { setBusy(false) }
  }
  const startGroupDrag = (event, id) => {
    draggedGroupRef.current = id
    groupOrderChangedRef.current = false
    setDraggingGroup(id)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const dragGroup = (event) => {
    if (!draggedGroupRef.current) return
    const target = document.elementFromPoint?.(event.clientX, event.clientY)?.closest?.('[data-group-id]')?.dataset.groupId
    if (target) moveGroup(draggedGroupRef.current, target)
  }
  const finishGroupDrag = () => {
    if (!draggedGroupRef.current) return
    draggedGroupRef.current = null
    setDraggingGroup(null)
    persistGroupOrder()
  }
  const moveGroupWithKeyboard = (event, id) => {
    if (!['ArrowUp','ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const current = groupOrderRef.current
    const index = current.findIndex((group) => group.id === id)
    const target = current[index + (event.key === 'ArrowUp' ? -1 : 1)]
    if (!target) return
    moveGroup(id, target.id)
    queueMicrotask(() => persistGroupOrder())
  }
  const saveGroup = async (e) => {
    e.preventDefault(); if (disabled) return
    const name = groupDraft.name.trim().replace(/\s+/g, ' ')
    if (categories.rows.some((g) => g.id !== groupDraft.id && personKey(g.name) === personKey(name))) { setGroupError('Tên nhóm đã tồn tại.'); return }
    setBusy(true); setGroupError('')
    try {
      const values = { name, icon: groupDraft.icon, sort: groupDraft.sort ?? categories.rows.length + 1 }
      if (groupDraft.created_at) await categories.update(groupDraft.id, values)
      else await categories.create({ id: groupDraft.id, ...values })
      if (draft) set('group', groupDraft.id)
      await refresh(); setGroupOpen(false); toast.success('Đã lưu nhóm. Danh sách chọn đã cập nhật.')
    } catch (error) { setGroupError(error.message) } finally { setBusy(false) }
  }
  const openPayment = (p = null) => {
    setPaymentError('')
    setPayment(p ? { ...p, amount: String(p.amount), payer_id: p.payer_id || '', note: p.note || '', attachments: p.attachments || [] } : { id: crypto.randomUUID(), item_id: detailId, amount: '', payer_id: '', spent_at: localDate(), note: '', attachments: [] })
  }
  const savePayment = async (e) => {
    e.preventDefault(); if (disabled) return
    if (!payment.payer_id || !validMoney(payment.amount) || Number(payment.amount) <= 0) { setPaymentError('Chọn người trả và nhập số tiền lớn hơn 0.'); return }
    setBusy(true); setPaymentError('')
    try {
      const { error } = await supabase.rpc('save_payment', { p_id: payment.id, p_expected: payment.updated_at || null, p_values: { ...payment, amount: Number(payment.amount) } })
      if (error) throw error
      await refresh(); setPayment(null); toast.success('Đã lưu khoản chi.')
    } catch (error) { setPaymentError(error.message) } finally { setBusy(false) }
  }
  const confirmAction = async (e) => {
    e.preventDefault(); if (busy) return
    setBusy(true)
    try {
      if (confirm.type === 'deleteGroup') {
        const { error } = await supabase.rpc('delete_main_category', { p_id: confirm.row.id, p_move_to: moveToGroup || null })
        if (error) throw error
        const next = groupOrderRef.current.filter((g) => g.id !== confirm.row.id)
        groupOrderRef.current = next; setGroupOrder(next); setGroupDraft(null)
        if (draft?.group === confirm.row.id) set('group', moveToGroup)
      } else if (confirm.type === 'deletePayment') {
        const { error } = await supabase.rpc('delete_payment', { p_id: confirm.row.id, p_expected: confirm.row.updated_at || null })
        if (error) throw error
      } else {
        await source.remove(confirm.row.id)
        setDraft(null); setDetailId(null)
      }
      await refresh(); setConfirm(null); toast.success(confirm.type === 'deleteGroup' ? 'Đã xóa nhóm.' : confirm.type === 'deletePayment' ? 'Đã xóa lần thanh toán.' : 'Đã xóa bản ghi.')
    } catch (error) { report(error) } finally { setBusy(false) }
  }
  const matches = (row) => task ? taskMatches(row, { search, scope, state, me }) : (!search || [row.name,row.category,row.note].join(' ').toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) && (!['pending','partial','paid'].includes(state) || budgetPaymentState(row, paymentTotal(byItem[row.id] || [])) === state) && (state !== 'unassigned' || (byItem[row.id] || []).some((p) => !p.voided_at && !p.payer_id && Number(p.amount) !== 0))
  const loading = source.loading || categories.loading || (!task && (payments.loading || members.loading))
  const groupRecords = confirm?.type === 'deleteGroup' ? [...tasks.rows.filter((r) => r.category_id === confirm.row.id || (!r.category_id && r.dept === confirm.row.name)), ...budgets.rows.filter((r) => r.category_id === confirm.row.id || (!r.category_id && r.category === confirm.row.name))].length : 0
  const error = source.error || categories.error || (!task && (payments.error || members.error))

  return <div className={`pw ${task ? 'pw-tasks' : 'pw-budget'}`}>
    <header className="pw-titlebar pw-compact-header"><h1>{task ? 'Công việc' : 'Ngân sách'}</h1><button className="pw-primary" aria-label={task ? 'Thêm công việc' : 'Thêm khoản ngân sách'} onClick={() => openNew()}><Plus size={19} /><span className="pw-add-label">Thêm<span className="pw-desktop-label"> {task ? 'công việc' : 'ngân sách'}</span></span></button></header>
    {task ? <div className="pw-stats"><Stat label="Cần làm" value={stats.todo} onClick={() => setQuickView('todo')} /><Stat label="Đang làm" value={stats.doing} tone="amber" onClick={() => setQuickView('doing')} /><Stat label="Quá hạn" value={stats.overdue} tone="red" onClick={() => setQuickView('overdue')} /></div> : <><div className="pw-stats budget" style={{ '--people-count': members.rows.length }}><Stat label="Tổng dự toán" value={money(summary.planned)} tone="blue" onClick={() => setBudgetView({ type:'planned', label:'Tổng dự toán' })} /><Stat label="Tổng thực chi" value={money(summary.actual)} tone="teal" onClick={() => setBudgetView({ type:'actual', label:'Tổng thực chi' })} />{summary.people.map((p, index) => <Stat key={p.id} label={`${personName(p.name)} đã chi`} value={money(p.spent)} tone={`person person-${index % 2}`} onClick={() => setBudgetView({ type:'person', memberId:p.id, label:`${personName(p.name)} đã chi` })} />)}</div>{summary.unassigned !== 0 && <button className={`pw-unassigned ${state === 'unassigned' ? 'active' : ''}`} aria-pressed={state === 'unassigned'} onClick={() => { setSearch(''); setState(state === 'unassigned' ? 'all' : 'unassigned'); setExpanded({}) }}><span>Chưa rõ người trả <strong>{money(summary.unassigned)}</strong></span><span>{state === 'unassigned' ? 'Bỏ lọc' : 'Xem khoản chi'} <ChevronDown size={14} /></span></button>}</>}
    <div className="pw-toolbar"><div className="pw-search"><Search size={18} /><input aria-label="Tìm kiếm" placeholder={task ? 'Tìm công việc…' : 'Tìm khoản chi…'} value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="pw-filters">{task ? <>{[['all','Tất cả'],['mine','Của tôi'],['both','Cả hai']].map(([key,label]) => <button className={`pw-chip ${scope === key ? 'active' : ''}`} aria-pressed={scope === key} key={key} onClick={() => setScope(key)}>{label}</button>)}<select className="pw-filter-select" aria-label="Lọc trạng thái" value={state} onChange={(e) => setState(e.target.value)}><option value="all">Mọi trạng thái</option>{Object.entries(taskStates).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></> : <label className="pw-budget-status-filter"><span>Trạng thái</span><select className="pw-filter-select" aria-label="Lọc trạng thái thanh toán" value={state} onChange={(e) => setState(e.target.value)}><option value="all">Mọi trạng thái</option><option value="pending">Chưa chi</option><option value="partial">Đã cọc / Một phần</option><option value="paid">Đã thanh toán</option><option value="unassigned">Chưa rõ người trả</option></select></label>}</div><div className="pw-tool-actions"><div className="pw-view-switch" role="group" aria-label={`Kiểu hiển thị ${task ? 'checklist' : 'ngân sách'}`}><button type="button" aria-label="Dạng nhóm" aria-pressed={layout === 'groups'} onClick={() => setLayout('groups')}><LayoutList size={16} /><span>Nhóm</span></button><button type="button" aria-label="Dạng bảng" aria-pressed={layout === 'table'} onClick={() => setLayout('table')}><Table2 size={16} /><span>Bảng</span></button></div><button className="pw-secondary pw-manage-groups" aria-label="Quản lý nhóm" title="Quản lý nhóm" onClick={openGroupManager}><Settings2 size={17} /><span>Nhóm</span></button><button className="pw-sheet-sync" type="button" disabled={sheetSyncing} onClick={() => setSheetConfirmOpen(true)} aria-label={`Đồng bộ ${task ? 'checklist' : 'ngân sách'} sang Google Sheet`} title={`Ghi đè tab ${task ? 'CHECKLIST' : 'PHÂN BỔ NGÂN SÁCH'} bằng dữ liệu hiện tại`}><CloudUpload size={17} /><span className="pw-sheet-sync-full">Đồng bộ Sheet</span><span className="pw-sheet-sync-short">Sheet</span></button><button className="pw-reload" onClick={syncNow} disabled={busy || syncing} aria-busy={syncing} aria-label={syncing ? "Đang đồng bộ dữ liệu" : "Tải lại dữ liệu"} title={syncing ? "Đang đồng bộ…" : "Tải lại dữ liệu"}><RefreshCw size={17} className={syncing ? "animate-spin" : undefined} /></button></div></div>
    {error && <div role="alert" className="pw-error">Không tải được dữ liệu: {error.message} <button onClick={syncNow} disabled={syncing}>Thử lại</button></div>}
    {sheetSyncResult && <div className="pw-sheet-sync-result"><ShieldCheck size={16} /><span>Google Sheet đã cập nhật {sheetSyncResult.rows} dòng lúc {sheetSyncResult.syncedAt ? new Date(sheetSyncResult.syncedAt).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }) : 'vừa xong'}.</span></div>}
    {loading ? <div className="pw-loading"><Loader2 className="animate-spin" size={21} />Đang đồng bộ…</div> : layout === 'table' ? (task ? <TaskGroupTable groups={groups} matches={matches} onOpen={openRecord} onAdd={openNew} filtered={Boolean(search || state !== 'all' || scope !== 'all')} /> : <BudgetGroupTable groups={groups} matches={matches} byItem={byItem} members={members.rows} onOpen={openRecord} onAdd={openNew} filtered={Boolean(search || state !== 'all')} />) : <div className="pw-groups">{groups.map((g) => {
      const rows = g.records.filter(matches)
      if (!rows.length && (search || state !== 'all' || scope !== 'all')) return null
      const open = expanded[g.id] ?? Boolean(search || state !== 'all' || scope !== 'all')
      const spent = g.records.reduce((n, row) => n + paymentTotal(byItem[row.id] || []), 0)
      return <section className="pw-group" key={g.id} style={{ '--group-accent': ['#6caeff','#54d8bc','#f3b869','#b49aff','#ef91bb','#78cddd'][Array.from(g.id).reduce((sum, c) => sum + c.codePointAt(0), 0) % 6] }}><button className="pw-group-header" aria-expanded={open} onClick={() => setExpanded((prev) => ({ ...prev, [g.id]: !open }))}><span className="pw-group-icon"><GroupIcon name={g.icon} /></span><span className="pw-group-name"><strong>{g.name}</strong>{task ? <small>{g.records.length ? `${g.records.filter((t) => t.status === 'done').length} hoàn thành · ${g.records.length} công việc` : 'Thêm công việc đầu tiên cho nhóm'}</small> : <small className="pw-spent"><Banknote size={15} aria-hidden="true" />Đã chi {money(spent)}</small>}</span><span className="pw-count">{task ? `${g.records.filter((t) => t.status === 'done').length}/${g.records.length}` : `${g.records.length} khoản`}</span>{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>{open && <div><div className={`pw-group-columns ${task ? '' : 'budget'}`}><span>{task ? 'Công việc' : 'Khoản chi'}</span><span>{task ? 'Phụ trách' : 'Dự toán'}</span><span>{task ? 'Trạng thái' : 'Thực chi'}</span><span>{task ? 'Ưu tiên' : 'Thanh toán'}</span>{task && <span>Hạn hoàn thành</span>}</div><div className={`pw-group-records ${task ? 'tasks' : `budget${rows.length > 5 ? ' scrollable' : ''}`}`}>{rows.map((row) => {
        const actual = paymentTotal(byItem[row.id] || [])
        const st = task ? row.status : budgetPaymentState(row, actual)
        return <article key={row.id} className={`pw-record ${task ? '' : 'budget'}`} role="button" tabIndex={0} aria-label={`Mở ${task ? row.title : row.name}`} onClick={() => openRecord(row)} onKeyDown={(e) => { if (e.target === e.currentTarget && ['Enter',' '].includes(e.key)) { e.preventDefault(); openRecord(row) } }}><div className="pw-row-title">{task ? <button className={`pw-check ${row.status === 'done' ? 'checked' : ''}`} disabled={busy} aria-label={`${row.status === 'done' ? 'Mở lại' : 'Hoàn thành'} ${row.title}`} onClick={(e) => { e.stopPropagation(); toggleTask(row) }}>{row.status === 'done' && <Check size={15} />}</button> : <Wallet size={21} color="#9dbbdf" />}<div className="pw-row-content"><div className="pw-budget-titleline"><strong className={task && row.status === 'done' ? 'pw-complete' : ''}>{task ? row.title : row.name}</strong></div>{!task && <div className="pw-budget-mobile-values"><MoneyMetric label="Dự toán" value={compact(row.planned)} /><MoneyMetric label="Thực chi" value={compact(actual)} spent /><BudgetState state={st} planned={row.planned} actual={actual} metric /></div>}<div className="pw-mobile-meta">{task && <span className="pw-task-meta pw-task-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span><span>{personName(row.assignee) || 'Chưa giao'}</span></span>}{task && <span className="pw-task-status"><Pill value={st}>{taskStates[st] || st}</Pill></span>}{task && row.deadline && <span className={`pw-task-meta pw-task-date ${isOverdue(row) ? 'overdue' : ''}`}><Calendar size={13} aria-hidden="true" /><span>{date(row.deadline)}</span></span>}</div></div></div>{task ? <><span className="pw-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span>{personName(row.assignee) || 'Chưa giao'}</span><Pill value={st}>{taskStates[st] || st}</Pill><Pill value={row.priority}>{priorities[row.priority] || row.priority}</Pill><span className={`pw-row-date ${isOverdue(row) ? 'overdue' : ''}`}>{date(row.deadline)}</span></> : <><span className="pw-amount pw-budget-planned">{money(row.planned)}</span><span className="pw-amount pw-budget-actual">{money(actual)}</span><BudgetState state={st} planned={row.planned} actual={actual} /></>}</article>
      })}{!rows.length && <div className="pw-empty">Nhóm chưa có {task ? 'công việc' : 'khoản chi'}.</div>}</div><button className="pw-add-row" onClick={() => openNew(g.id)}><Plus size={16} />{task ? 'Thêm việc vào nhóm' : 'Thêm khoản chi'}</button></div>}</section>
    })}{!groups.length && <div className="pw-empty">Tạo nhóm đầu tiên để bắt đầu.</div>}{groups.length > 0 && !groups.some((g) => g.records.some(matches) || (!g.records.length && !search && scope === 'all' && state === 'all')) && <div className="pw-empty">Không có bản ghi phù hợp.</div>}</div>}
    <PlanningNav />

    <PlanningPanel open={task && Boolean(quickView)} title={`${quickLabel[quickView] || 'Công việc'} · ${quickTasks.length}`} onClose={() => setQuickView(null)} variant="quick">
      <div className="pw-quick-list">{quickTasks.map((row) => {
        const group = allGroups.find((item) => item.id === row.category_id || item.name === row.dept)
        const overdue = isOverdue(row)
        return <article key={row.id} className={`pw-quick-task ${overdue ? 'overdue' : ''}`} role="button" tabIndex={0} aria-label={`Mở nhanh ${row.title}`} onClick={() => { setQuickView(null); openRecord(row) }} onKeyDown={(e) => { if (e.target === e.currentTarget && ['Enter',' '].includes(e.key)) { e.preventDefault(); setQuickView(null); openRecord(row) } }}><button className={`pw-check ${row.status === 'done' ? 'checked' : ''}`} disabled={busy} aria-label={`Hoàn thành ${row.title}`} onClick={(e) => { e.stopPropagation(); toggleTask(row) }}>{row.status === 'done' && <Check size={15} />}</button><div className="pw-quick-content"><span className="pw-quick-group"><GroupIcon name={group?.icon} />{group?.name || row.dept || 'Chưa phân nhóm'}</span><strong>{row.title}</strong><div className="pw-quick-meta"><span className="pw-quick-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span>{personName(row.assignee) || 'Chưa giao'}</span><Pill value={row.status}>{taskStates[row.status] || row.status}</Pill>{row.deadline && <span className={`pw-quick-date ${overdue ? 'overdue' : ''}`}><Calendar size={13} aria-hidden="true" />{date(row.deadline)}</span>}</div></div><ChevronRight className="pw-quick-arrow" size={19} aria-hidden="true" /></article>
      })}{!quickTasks.length && <div className="pw-quick-empty"><Check size={24} /><strong>Không có công việc</strong><span>Danh sách này hiện đang trống.</span></div>}</div>
    </PlanningPanel>

    <PlanningPanel open={!task && Boolean(budgetView)} title={`${budgetView?.label || 'Ngân sách'} · ${budgetQuickRows.length}`} onClose={() => setBudgetView(null)} variant="quick" wide>
      <BudgetQuickTable rows={budgetQuickRows} view={budgetView} budgets={budgets.rows} onOpen={(id) => { setBudgetView(null); setDetailId(id) }} />
    </PlanningPanel>

    <PlanningPanel open={sheetConfirmOpen} title="Đồng bộ Sheet" variant="sync" busy={sheetSyncing} onClose={() => setSheetConfirmOpen(false)} footer={<><button className="pw-secondary" disabled={sheetSyncing} onClick={() => setSheetConfirmOpen(false)}>Huỷ</button><BusyButton busy={sheetSyncing} onClick={syncSheet}><CloudUpload size={17} />Đồng bộ</BusyButton></>}>
      <div className="pw-sheet-alert"><span className="pw-sheet-alert-icon"><CloudUpload size={22} /></span><p>Ghi dữ liệu {task ? 'công việc' : 'ngân sách'} hiện tại sang tab <strong>{task ? 'CHECKLIST' : 'PHÂN BỔ NGÂN SÁCH'}</strong>.</p></div>
    </PlanningPanel>

    <PlanningPanel open={Boolean(draft)} title={task ? (draft?.updated_at ? 'Chi tiết công việc' : 'Thêm công việc') : (draft?.updated_at ? 'Sửa khoản ngân sách' : 'Thêm khoản ngân sách')} busy={disabled} onClose={() => setDraft(null)} wide footer={<><button className="pw-secondary" disabled={disabled} onClick={() => setDraft(null)}>Đóng</button><BusyButton busy={disabled} type="submit" form="planning-record-form">Lưu thay đổi</BusyButton></>}>
      {draft && <form id="planning-record-form" className="pw-edit-form" onSubmit={saveRecord}><div className="pw-form-grid"><Field label={task ? 'Tên công việc *' : 'Tên khoản ngân sách *'} full><input required maxLength={300} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder={task ? 'Ví dụ: Lắp hệ thống hút khói' : 'Ví dụ: Thi công mặt bằng'} /></Field><Field label="Nhóm *"><select required value={draft.group} onChange={(e) => set('group', e.target.value)}><option value="">Chọn nhóm</option>{allGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field><Field label=""><button type="button" className="pw-secondary" onClick={openGroupManager}><Plus size={17} />Tạo / sửa nhóm</button></Field>{task ? <><Field label="Người phụ trách"><select value={draft.assignee || ''} onChange={(e) => set('assignee', e.target.value)}><option value="">Chưa giao</option>{names.map((n) => <option key={n} value={n}>{personName(n)}</option>)}<option value="Cả hai">Cả hai</option></select></Field><Field label="Trạng thái"><select value={draft.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(taskStates).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Ưu tiên"><select value={draft.priority} onChange={(e) => set('priority', e.target.value)} data-tone={draft.priority}>{Object.entries(priorities).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Hạn hoàn thành"><input type="date" value={draft.deadline || ''} onChange={(e) => set('deadline', e.target.value)} /></Field><Field label="Khoản ngân sách liên quan" full><select value={draft.linked_budget_id || ''} onChange={(e) => set('linked_budget_id', e.target.value)}><option value="">Chưa liên kết</option>{budgets.rows.map((b) => <option key={b.id} value={b.id}>{b.name} · Đã chi {money(paymentTotal(byItem[b.id] || []))}</option>)}</select></Field><Field label="Ghi chú" full><textarea maxLength={10000} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Nội dung trao đổi, yêu cầu nghiệm thu…" /></Field></> : <><Field label="Dự toán (đ) *"><input required inputMode="numeric" value={draft.planned} onChange={(e) => set('planned', e.target.value.replace(/\D/g,''))} placeholder="0" /></Field><Field label="Giá trị chốt (đ) · không bắt buộc"><input inputMode="numeric" value={draft.agreed_amount} onChange={(e) => set('agreed_amount', e.target.value.replace(/\D/g,''))} placeholder="Để trống nếu chưa chốt" /></Field><Field label="Người phụ trách"><select value={draft.owner || ''} onChange={(e) => set('owner', e.target.value)}><option value="">Chưa giao</option>{names.map((n) => <option key={n} value={n}>{personName(n)}</option>)}<option value="Cả hai">Cả hai</option></select></Field><Field label="Ghi chú" full><textarea maxLength={10000} value={draft.note} onChange={(e) => set('note', e.target.value)} /></Field><p className="pw-muted full">Thực chi được tính từ các lần thanh toán. Người phụ trách có thể khác người trả tiền.</p></>}</div>{task && draft.linked_budget_id && draft.updated_at && <section className="pw-section"><button type="button" className="pw-link-box" disabled={disabled} onClick={() => navigate(`/budget?item=${draft.linked_budget_id}`)}><LinkIcon size={17} />Mở khoản ngân sách liên quan</button></section>}<section className="pw-section"><h3>Tệp đính kèm</h3><Attachments value={draft.attachments} onChange={(v) => set('attachments', v)} disabled={busy} onBusy={setUploading} /></section>{draft.updated_at && <History events={currentHistory} />}{formError && <p className="pw-error" role="alert">{formError}</p>}{draft.updated_at && <section className="pw-section"><button type="button" className="pw-secondary pw-danger" disabled={disabled} onClick={() => setConfirm({ type: 'delete', row: draft })}><Trash2 size={16} />Xóa {task ? 'công việc' : 'khoản ngân sách'}</button></section>}</form>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(detail) && !task} title="Chi tiết khoản chi" busy={disabled} onClose={() => setDetailId(null)} wide footer={<><button className="pw-secondary" disabled={disabled} onClick={() => editRecord(detail)}><Pencil size={16} />Chỉnh sửa</button><BusyButton busy={busy} onClick={() => openPayment()}><Plus size={18} />Ghi nhận chi</BusyButton></>}>
      {detail && <><div className="pw-detail-heading"><div><h3>{detail.name}</h3><p>{detail.category || 'Chưa phân nhóm'}</p></div><Pill value={budgetPaymentState(detail,detailActual)}>{budgetStates[budgetPaymentState(detail,detailActual)]}</Pill></div><div className="pw-detail-grid"><div><div className="pw-detail-summary"><SummaryLine label="Dự toán" value={money(detail.planned)} /><SummaryLine label="Giá trị chốt" value={detail.agreed_amount == null ? 'Chưa chốt' : money(detail.agreed_amount)} /><SummaryLine label="Đã thanh toán" value={money(detailActual)} />{detail.agreed_amount != null && <SummaryLine label={detailActual > detail.agreed_amount ? 'Chi vượt giá trị chốt' : 'Còn thanh toán'} value={money(Math.abs(detail.agreed_amount - detailActual))} />}</div><p className="pw-muted">{detail.owner ? `Phụ trách: ${personName(detail.owner)}` : 'Chưa giao người phụ trách'}</p><section className="pw-section"><h3>Ghi chú</h3><p className="pw-muted" style={{ whiteSpace: 'pre-wrap' }}>{detail.note || 'Chưa có ghi chú.'}</p></section><section className="pw-section"><h3>Tệp đính kèm</h3><Attachments value={detail.attachments} /></section><section className="pw-section"><h3>Công việc liên quan</h3>{tasks.rows.filter((t) => t.linked_budget_id === detailId).map((t) => <div key={t.id} className="pw-link-box"><LinkIcon size={16} /><span>{t.title}</span><Pill value={t.status}>{taskStates[t.status]}</Pill></div>)}{!tasks.rows.some((t) => t.linked_budget_id === detailId) && <p className="pw-muted">Chưa liên kết công việc.</p>}</section></div><div><h3 style={{ fontSize: 15, marginBottom: 12 }}>Các lần thanh toán</h3>{detailPayments.map((p) => {
        const payer = members.rows.find((m) => m.id === p.payer_id)
        const label = payer ? personName(payer.name) : 'Chưa xác định người trả'
        return <div className={`pw-payment ${p.voided_at ? 'void' : ''}`} key={p.id}><span className="pw-avatar">{payer ? label.slice(0,1) : '?'}</span><div className="pw-payment-body"><div className="pw-payment-top"><span>{label}</span><strong>{money(p.amount)}</strong></div><p>{p.note || 'Không có nội dung'}</p><small>{date(p.spent_at)}{p.voided_at ? ` · Đã hủy: ${p.void_reason}` : ''}</small><Attachments value={p.attachments} /><div className="pw-payment-actions">{!p.voided_at && p.amount > 0 && <button type="button" onClick={() => openPayment(p)}><Pencil size={12} style={{ display:'inline', marginRight:4 }} />{payer ? 'Sửa khoản chi' : 'Bổ sung người trả / sửa'}</button>}<button type="button" className="pw-delete-payment" onClick={() => setConfirm({ type: 'deletePayment', row: p })}><Trash2 size={13} />Xóa lần thanh toán</button></div></div></div>
      })}{!detailPayments.length && <p className="pw-muted">Chưa ghi nhận thanh toán.</p>}<History events={selectedHistory} /></div></div></>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(payment)} title={payment?.updated_at ? 'Sửa khoản chi' : 'Ghi nhận chi'} busy={disabled} onClose={() => setPayment(null)} footer={<><button className="pw-secondary" disabled={disabled} onClick={() => setPayment(null)}>Đóng</button><BusyButton busy={disabled} form="planning-payment-form" type="submit">Lưu khoản chi</BusyButton></>}>
      {payment && <form id="planning-payment-form" className="pw-edit-form pw-payment-form" onSubmit={savePayment}><div className="pw-payment-context"><strong>{budgets.rows.find((b) => b.id === payment.item_id)?.name}</strong><small>Ghi nhận số tiền đã thanh toán thực tế</small></div><div className="pw-form-grid"><Field label="Người trả *"><select required value={payment.payer_id} onChange={(e) => setPayment((p) => ({ ...p, payer_id: e.target.value }))}><option value="">Chọn người trả</option>{members.rows.map((m) => <option key={m.id} value={m.id}>{personName(m.name)}</option>)}</select></Field><Field label="Số tiền (đ) *"><input required inputMode="numeric" value={payment.amount} onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value.replace(/\D/g,'') }))} placeholder="0" /></Field><Field label="Ngày thanh toán *"><input required type="date" value={payment.spent_at} onChange={(e) => setPayment((p) => ({ ...p, spent_at: e.target.value }))} /></Field><Field label="Nội dung" full><textarea maxLength={10000} value={payment.note} onChange={(e) => setPayment((p) => ({ ...p, note: e.target.value }))} placeholder="Ví dụ: Cọc thi công đợt 1" /></Field></div><section className="pw-section"><h3>Ảnh hóa đơn / tệp</h3><Attachments value={payment.attachments} onChange={(v) => setPayment((p) => ({ ...p, attachments: v }))} onBusy={setUploading} disabled={busy} /></section><p className="pw-muted" style={{ marginTop:18 }}>Tổng chi tự cập nhật sau khi lưu.</p>{paymentError && <p className="pw-error" role="alert">{paymentError}</p>}</form>}
    </PlanningPanel>

    <PlanningPanel open={groupOpen} title="Quản lý nhóm" onClose={() => setGroupOpen(false)} busy={busy} footer={<><button className="pw-secondary" disabled={busy} onClick={() => setGroupDraft({ id: crypto.randomUUID(), name:'', icon:'folder' })}>Nhóm mới</button>{groupDraft && categories.rows.some((g) => g.id === groupDraft.id) && <button type="button" className="pw-delete-payment pw-group-delete" disabled={busy} onClick={() => { setMoveToGroup(''); setConfirm({ type:'deleteGroup', row:categories.rows.find((g) => g.id === groupDraft.id) }) }}><Trash2 size={15} />Xóa nhóm</button>}<BusyButton busy={busy || !groupDraft} form="planning-group-form" type="submit">{groupDraft?.created_at ? 'Lưu nhóm' : 'Tạo nhóm'}</BusyButton></>}>
      <p className="pw-group-order-help"><GripVertical size={15} />Giữ và kéo để đổi thứ tự nhóm</p><div className="pw-group-manager-list pw-sortable-groups">{groupOrder.map((g, index) => <div key={g.id} data-group-id={g.id} className={`pw-sortable-group ${draggingGroup === g.id ? 'dragging' : ''}`}><button type="button" className="pw-drag-handle" aria-label={`Kéo sắp xếp ${g.name}`} title="Kéo để đổi vị trí · dùng phím lên/xuống nếu cần" onPointerDown={(e) => startGroupDrag(e, g.id)} onPointerMove={dragGroup} onPointerUp={finishGroupDrag} onPointerCancel={finishGroupDrag} onKeyDown={(e) => moveGroupWithKeyboard(e, g.id)}><GripVertical size={18} /><span>{index + 1}</span></button><button type="button" className="pw-group-edit" onClick={() => { setGroupDraft(g); setGroupError('') }}><GroupIcon name={g.icon} /><span>{g.name}</span><Pencil size={13} /></button></div>)}</div>{groupDraft && <form id="planning-group-form" className="pw-edit-form pw-group-form" onSubmit={saveGroup}><div className="pw-form-grid"><Field label="Tên nhóm *" full><input required maxLength={120} value={groupDraft.name} onChange={(e) => setGroupDraft((g) => ({ ...g, name:e.target.value }))} placeholder="Ví dụ: Mặt bằng & thi công" /></Field><Field label="Biểu tượng" full><div className="pw-icon-picker" role="region" aria-label="Kho biểu tượng" tabIndex={0}>{iconSections.map((section) => <section className={`pw-icon-section ${section.tone}`} key={section.name}><h4>{section.name}</h4><div className="pw-icon-grid">{section.items.map(([key, label]) => <button type="button" aria-label={label} title={label} aria-pressed={groupDraft.icon === key} key={key} className={groupDraft.icon === key ? 'selected' : ''} onClick={() => setGroupDraft((g) => ({ ...g, icon:key }))}><GroupIcon name={key} /><span>{label}</span></button>)}</div></section>)}</div></Field></div>{groupError && <p className="pw-error" role="alert">{groupError}</p>}</form>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(confirm)} title={confirm?.type === 'deleteGroup' ? 'Xóa nhóm' : confirm?.type === 'deletePayment' ? 'Xóa lần thanh toán' : 'Xóa bản ghi'} busy={busy} onClose={() => setConfirm(null)} footer={<><button className="pw-secondary" disabled={busy} onClick={() => setConfirm(null)}>Quay lại</button><BusyButton busy={busy} type="submit" form="planning-confirm-form">Xác nhận xóa</BusyButton></>}>
      {confirm && <form id="planning-confirm-form" onSubmit={confirmAction}>{confirm.type === 'deleteGroup' ? <><p className="pw-muted">Xóa nhóm “{confirm.row.name}” khỏi Checklist và Ngân sách?</p>{groupRecords > 0 ? <><p className="pw-muted pw-group-delete-info">{groupRecords} bản ghi sẽ được chuyển sang nhóm bạn chọn. Các lần thanh toán vẫn được giữ.</p><Field label="Chuyển dữ liệu sang nhóm *"><select required value={moveToGroup} onChange={(e) => setMoveToGroup(e.target.value)}><option value="">Chọn nhóm nhận dữ liệu</option>{categories.rows.filter((g) => g.id !== confirm.row.id).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>{categories.rows.length < 2 && <p className="pw-error">Hãy tạo một nhóm khác trước khi xóa nhóm có dữ liệu.</p>}</> : <p className="pw-muted pw-group-delete-info">Nhóm trống, có thể xóa ngay.</p>}</> : <p className="pw-muted">{confirm.type === 'deletePayment' ? <>Xóa vĩnh viễn lần thanh toán <strong className="pw-confirm-money">{money(confirm.row.amount)}</strong>? Tổng thực chi và số tiền của người trả sẽ được cập nhật ngay.</> : <>Xóa “{confirm.row.title || confirm.row.name}”? Khoản ngân sách đã có thanh toán không thể xóa.</>}</p>}</form>}
    </PlanningPanel>
  </div>
}

function MoneyMetric({ label, value, spent = false }) { return <span className={`pw-money-metric ${spent ? 'spent' : ''}`}><small>{label}</small><strong>{spent && <Banknote size={13} aria-hidden="true" />}{value}</strong></span> }
function BudgetQuickTable({ rows, view, budgets, onOpen }) {
  if (!rows.length) return <div className="pw-quick-empty"><Banknote size={24} /><strong>Chưa có khoản chi</strong><span>Dữ liệu mới sẽ tự xuất hiện tại đây.</span></div>
  const person = view?.type === 'person'
  const openRow = (event, id) => {
    if (event.type === 'keydown' && !['Enter',' '].includes(event.key)) return
    if (event.type === 'keydown') event.preventDefault()
    onOpen(id)
  }
  return <div className={`pw-budget-table-shell ${person ? 'person' : ''}`}>
    <table className="pw-budget-table">
      <thead><tr>{person ? <><th>Khoản chi</th><th>Ngày chi</th><th className="numeric">Số tiền</th><th>Nội dung</th></> : <><th>Khoản chi</th><th className="numeric">Dự toán</th><th className="numeric">Thực chi</th><th>Trạng thái</th></>}</tr></thead>
      <tbody>{rows.map((row) => {
        if (person) {
          const item = budgets.find((budget) => budget.id === row.item_id)
          if (!item) return null
          return <tr key={row.id} role="button" tabIndex={0} aria-label={`Mở khoản chi ${item.name}`} onClick={(event) => openRow(event, item.id)} onKeyDown={(event) => openRow(event, item.id)}><td className="pw-budget-table-name"><span className="pw-budget-table-icon"><Banknote size={15} /></span><span><strong>{item.name}</strong><small>{item.category || 'Chưa phân nhóm'}</small></span></td><td className="pw-budget-table-date">{date(row.spent_at)}</td><td className="pw-budget-table-amount actual"><TableMoney value={row.amount} /></td><td className="pw-budget-table-note" title={row.note || ''}>{row.note || '—'}</td></tr>
        }
        const status = budgetPaymentState(row, row.actual)
        return <tr key={row.id} role="button" tabIndex={0} aria-label={`Mở khoản chi ${row.name}`} onClick={(event) => openRow(event, row.id)} onKeyDown={(event) => openRow(event, row.id)}><td className="pw-budget-table-name"><span className="pw-budget-table-icon"><Wallet size={15} /></span><span><strong>{row.name}</strong><small>{row.category || 'Chưa phân nhóm'}</small></span></td><td className="pw-budget-table-amount planned"><TableMoney value={row.planned} /></td><td className="pw-budget-table-amount actual"><TableMoney value={row.actual} /></td><td className="pw-budget-table-status"><BudgetState state={status} planned={row.planned} actual={row.actual} /></td></tr>
      })}</tbody>
    </table>
  </div>
}
function TaskGroupTable({ groups, matches, onOpen, onAdd, filtered }) {
  const visible = groups.map((group) => ({ ...group, records:group.records.filter(matches) })).filter((group) => group.records.length || !filtered)
  const rows = visible.flatMap((group) => group.records)
  const totals = rows.reduce((sum, row) => {
    const status = isOverdue(row) ? 'overdue' : row.status
    sum.total += 1
    if (status === 'done') sum.done += 1
    else if (status === 'doing') sum.doing += 1
    else if (status === 'overdue') sum.overdue += 1
    else sum.todo += 1
    return sum
  }, { total:0, todo:0, doing:0, done:0, overdue:0 })
  return <div className="pw-ledger-shell pw-task-ledger-shell" role="region" aria-label="Bảng checklist theo nhóm" tabIndex={0}>
    <table className="pw-ledger pw-task-ledger">
      <thead><tr><th>Nhóm</th><th>Công việc</th><th>Phụ trách</th><th>Trạng thái</th><th>Ưu tiên</th><th>Hạn</th><th>Ghi chú</th></tr></thead>
      {visible.map((group) => <tbody key={group.id}>{group.records.length ? group.records.map((row, index) => {
        const status = isOverdue(row) ? 'overdue' : row.status
        return <tr key={row.id}>{index === 0 && <th className="pw-ledger-group" scope="rowgroup" rowSpan={group.records.length}><strong>{group.name}</strong></th>}<td><button className="pw-ledger-open" onClick={() => onOpen(row)} aria-label={`Mở ${row.title}`}>{row.title}</button></td><td className="pw-task-ledger-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span><span>{personName(row.assignee) || 'Chưa giao'}</span></td><td><span className={`pw-ledger-status task-${status}`}>{taskStates[status] || status}</span></td><td><span className={`pw-task-ledger-priority ${row.priority}`}>{priorities[row.priority] || row.priority}</span></td><td className={`pw-task-ledger-date ${status === 'overdue' ? 'overdue' : ''}`}>{row.deadline ? date(row.deadline) : '—'}</td><td className="pw-ledger-note"><LedgerNote value={row.description} /></td></tr>
      }) : <tr><th className="pw-ledger-group" scope="rowgroup"><strong>{group.name}</strong></th><td colSpan={6}><button className="pw-ledger-empty" onClick={() => onAdd(group.id)}><Plus size={12} />Thêm công việc</button></td></tr>}</tbody>)}
      {rows.length > 0 && <tfoot><tr className="pw-task-ledger-total"><td colSpan={2}><span>Tổng công việc</span><strong>{totals.total}</strong></td><td><span>Cần làm <strong>{totals.todo}</strong></span></td><td><span>Đang làm <strong>{totals.doing}</strong></span></td><td><span>Hoàn thành <strong>{totals.done}</strong></span></td><td colSpan={2}><span>Quá hạn <strong>{totals.overdue}</strong></span></td></tr></tfoot>}
    </table>{!visible.length && <div className="pw-empty">Không có công việc phù hợp.</div>}
  </div>
}
function BudgetGroupTable({ groups, matches, byItem, members, onOpen, onAdd, filtered }) {
  const visible = groups.map((g) => ({ ...g, records:g.records.filter(matches) })).filter((g) => g.records.length || !filtered)
  const nam = members.find((member) => personKey(member.name) === 'nam') || members.find((member) => personKey(member.name).startsWith('nam'))
  const phuong = members.find((member) => personKey(member.name) === 'phuong') || members.find((member) => personKey(member.name).startsWith('phuong'))
  const personSpent = (payments, member) => member ? payments.filter((payment) => !payment.voided_at && payment.payer_id === member.id).reduce((sum, payment) => sum + Number(payment.amount || 0), 0) : 0
  const totals = visible.flatMap((group) => group.records).reduce((sum, row) => {
    const payments = byItem[row.id] || []
    return { planned:sum.planned + Number(row.planned || 0), actual:sum.actual + paymentTotal(payments), nam:sum.nam + personSpent(payments, nam), phuong:sum.phuong + personSpent(payments, phuong) }
  }, { planned:0, actual:0, nam:0, phuong:0 })
  const attributedTotal = totals.nam + totals.phuong
  const namRatio = attributedTotal > 0 ? Math.round(totals.nam / attributedTotal * 100) : 0
  const phuongRatio = attributedTotal > 0 ? 100 - namRatio : 0
  return <div className="pw-ledger-shell" role="region" aria-label="Bảng ngân sách theo nhóm" tabIndex={0}>
    <table className="pw-ledger">
      <thead><tr><th>Nhóm chi phí</th><th>Hạng mục</th><th className="numeric">Dự toán</th><th className="numeric">Nam đã chi</th><th className="numeric">Phương đã chi</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
      {visible.map((g) => <tbody key={g.id}>{g.records.length ? g.records.map((row,index) => {
        const rowPayments=byItem[row.id] || []
        const actual=paymentTotal(rowPayments)
        const namSpent=personSpent(rowPayments,nam)
        const phuongSpent=personSpent(rowPayments,phuong)
        const status=budgetPaymentState(row,actual)
        return <tr key={row.id}>{index === 0 && <th className="pw-ledger-group" scope="rowgroup" rowSpan={g.records.length}><strong>{g.name}</strong></th>}<td><button className="pw-ledger-open" onClick={() => onOpen(row)} aria-label={`Mở ${row.name}`}>{row.name}</button></td><td className="numeric planned"><TableMoney value={row.planned} /></td><td className="numeric person nam"><TableMoney value={namSpent} /></td><td className="numeric person phuong"><TableMoney value={phuongSpent} /></td><td><span className={`pw-ledger-status ${status}`}>{status === 'partial' ? 'Một phần' : status === 'paid' ? 'Đã trả' : 'Chưa chi'}</span></td><td className="pw-ledger-note"><LedgerNote value={row.note} /></td></tr>
      }) : <tr><th className="pw-ledger-group" scope="rowgroup"><strong>{g.name}</strong></th><td colSpan={6}><button className="pw-ledger-empty" onClick={() => onAdd(g.id)}><Plus size={12} />Thêm khoản chi</button></td></tr>}</tbody>)}
      {visible.some((group) => group.records.length) && <tfoot><tr className="pw-ledger-grand-total"><td colSpan={2}><span>Tổng đã chi</span><strong>{money(totals.actual)}</strong></td><td className="numeric planned"><TableMoney value={totals.planned} /></td><td className="numeric person nam"><TableMoney value={totals.nam} /></td><td className="numeric person phuong"><TableMoney value={totals.phuong} /></td><td colSpan={2}><span className="pw-spending-ratio nam">Nam <strong>{namRatio}%</strong></span><span className="pw-spending-ratio phuong">Phương <strong>{phuongRatio}%</strong></span></td></tr></tfoot>}
    </table>{!visible.length && <div className="pw-empty">Không có bản ghi phù hợp.</div>}
  </div>
}
function TableMoney({ value }) {
  const full = money(value)
  const short = compact(value)
  if (full === short) return <span className="pw-table-money-full pw-table-money-compact">{full}</span>
  return <><span className="pw-table-money-full">{full}</span><span className="pw-table-money-compact">{short}</span></>
}
function LedgerNote({ value }) {
  const note = value || '—'
  return <span className="pw-ledger-note-text" tabIndex={0} aria-label={`Ghi chú: ${note}`}>{note}</span>
}
function BudgetState({ state, planned, actual, metric = false }) {
  const target = Math.max(Number(planned || 0), 0)
  const ratio = target > 0 ? Math.min(100, Math.round(Number(actual || 0) / target * 100)) : 0
  const Icon = state === 'paid' ? Check : state === 'partial' ? Banknote : Wallet
  return <span className={`pw-budget-state ${state} ${metric ? 'metric' : ''}`}><span className="pw-budget-state-icon"><Icon size={13} /></span><span className="pw-budget-state-copy"><strong>{budgetStates[state]}</strong><small>{ratio}% dự toán</small></span><i style={{ '--budget-progress': `${ratio}%` }} /></span>
}
function SummaryLine({ label, value }) { return <div className="pw-summary-line"><span>{label}</span><strong>{value}</strong></div> }
