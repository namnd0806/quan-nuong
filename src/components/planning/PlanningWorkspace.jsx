import React, { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Banknote, Plus, Search, ChevronDown, ChevronUp, Check, Settings2, RefreshCw, Pencil, Trash2, Wallet, Calendar, Loader2, Link as LinkIcon } from 'lucide-react'
import { useCollection } from '@/hooks/useCollection'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase'
import { formatVND } from '@/lib/utils'
import { localDate, isOverdue } from '@/lib/data-flow'
import { taskStates, priorities, budgetStates, planningGroups, spendingSummary, paymentTotal, personName, personKey, taskMatches, validMoney } from '@/lib/planning-model'
import { Attachments, PlanningPanel, PlanningNav, GroupIcon, groupIcons, Field, Stat, Pill, BusyButton, History } from './PlanningParts'
import './planning.css'

const money = (value) => formatVND(Number(value || 0))
const compact = (value) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(Number(value || 0) / 1000000)}tr`
const date = (value) => value ? value.split('-').reverse().join('/') : 'Chưa đặt hạn'
const iconNames = { folder:'Thư mục',tools:'Thi công',chair:'Nội thất',equipment:'Thiết bị',food:'Món ăn',document:'Giấy tờ',people:'Nhân sự',leaf:'Cây xanh',marketing:'Marketing',cash:'Tài chính' }
const paymentState = (item, actual) => item.status === 'paid' ? 'paid' : actual > 0 ? 'partial' : 'pending'
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
  const [expanded, setExpanded] = useState({})
  const [draft, setDraft] = useState(null)
  const [detailId, setDetailId] = useState(() => task ? null : searchParams.get('item'))
  const [payment, setPayment] = useState(null)
  const [groupOpen, setGroupOpen] = useState(false)
  const [groupDraft, setGroupDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const syncLock = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [groupError, setGroupError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [voidReason, setVoidReason] = useState('')
  const events = useCollection('workspace_events', { filterColumn: 'entity_id', filterValue: draft?.id || detailId || '00000000-0000-0000-0000-000000000000', limit: 100 })

  const me = profile?.name || user?.email?.split('@')[0] || ''
  const groups = useMemo(() => planningGroups(categories.rows, source.rows, kind).sort((a, b) => Number(b.records.length > 0) - Number(a.records.length > 0)), [categories.rows, source.rows, kind])
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
  const openGroupManager = () => { setGroupDraft({ id: crypto.randomUUID(), name: '', icon: 'folder' }); setGroupError(''); setGroupOpen(true) }
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
      if (confirm.type === 'void') {
        const { error } = await supabase.rpc('void_payment', { p_id: confirm.row.id, p_expected: confirm.row.updated_at, p_reason: voidReason })
        if (error) throw error
      } else {
        await source.remove(confirm.row.id)
        setDraft(null); setDetailId(null)
      }
      await refresh(); setConfirm(null); toast.success(confirm.type === 'void' ? 'Đã hủy khoản chi, lịch sử vẫn được giữ.' : 'Đã xóa bản ghi.')
    } catch (error) { report(error) } finally { setBusy(false) }
  }
  const matches = (row) => task ? taskMatches(row, { search, scope, state, me }) : (!search || [row.name,row.category,row.note].join(' ').toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) && (state !== 'unpaid' || paymentState(row, paymentTotal(byItem[row.id] || [])) !== 'paid') && (state !== 'unassigned' || (byItem[row.id] || []).some((p) => !p.voided_at && !p.payer_id && Number(p.amount) !== 0))
  const loading = source.loading || categories.loading || (!task && (payments.loading || members.loading))
  const error = source.error || categories.error || (!task && (payments.error || members.error))

  return <div className={`pw ${task ? 'pw-tasks' : 'pw-budget'}`}>
    <header className="pw-titlebar pw-compact-header"><h1>{task ? 'Công việc' : 'Ngân sách'}</h1><button className="pw-primary" aria-label={task ? 'Thêm công việc' : 'Thêm khoản ngân sách'} onClick={() => openNew()}><Plus size={19} /><span className="pw-add-label">Thêm<span className="pw-desktop-label"> {task ? 'công việc' : 'ngân sách'}</span></span></button></header>
    {task ? <div className="pw-stats"><Stat label="Cần làm" value={stats.todo} /><Stat label="Đang làm" value={stats.doing} tone="amber" /><Stat label="Quá hạn" value={stats.overdue} tone="red" /></div> : <><div className="pw-stats budget" style={{ '--people-count': members.rows.length }}><Stat label="Tổng dự toán" value={money(summary.planned)} tone="blue" /><Stat label="Tổng thực chi" value={money(summary.actual)} tone="teal" />{summary.people.map((p, index) => <Stat key={p.id} label={`${personName(p.name)} đã chi`} value={money(p.spent)} tone={`person person-${index % 2}`} />)}</div>{summary.unassigned !== 0 && <button className={`pw-unassigned ${state === 'unassigned' ? 'active' : ''}`} aria-pressed={state === 'unassigned'} onClick={() => { setSearch(''); setState(state === 'unassigned' ? 'all' : 'unassigned'); setExpanded({}) }}><span>Chưa rõ người trả <strong>{money(summary.unassigned)}</strong></span><span>{state === 'unassigned' ? 'Bỏ lọc' : 'Xem khoản chi'} <ChevronDown size={14} /></span></button>}</>}
    <div className="pw-toolbar"><div className="pw-search"><Search size={18} /><input aria-label="Tìm kiếm" placeholder={task ? 'Tìm công việc…' : 'Tìm khoản chi…'} value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="pw-filters">{task ? <>{[['all','Tất cả'],['mine','Của tôi'],['both','Cả hai']].map(([key,label]) => <button className={`pw-chip ${scope === key ? 'active' : ''}`} aria-pressed={scope === key} key={key} onClick={() => setScope(key)}>{label}</button>)}<select className="pw-filter-select" aria-label="Lọc trạng thái" value={state} onChange={(e) => setState(e.target.value)}><option value="all">Mọi trạng thái</option>{Object.entries(taskStates).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></> : [['all','Tất cả'],['unpaid','Còn thanh toán']].map(([key,label]) => <button key={key} onClick={() => setState(key)} className={`pw-chip ${state === key ? 'active' : ''}`} aria-pressed={state === key}>{label}</button>)}</div><div className="pw-tool-actions"><button className="pw-secondary pw-manage-groups" aria-label="Quản lý nhóm" title="Quản lý nhóm" onClick={openGroupManager}><Settings2 size={17} /><span>Nhóm</span></button><button className="pw-reload" onClick={syncNow} disabled={busy || syncing} aria-busy={syncing} aria-label={syncing ? "Đang đồng bộ dữ liệu" : "Tải lại dữ liệu"} title={syncing ? "Đang đồng bộ…" : "Tải lại dữ liệu"}><RefreshCw size={17} className={syncing ? "animate-spin" : undefined} /></button></div></div>
    {error && <div role="alert" className="pw-error">Không tải được dữ liệu: {error.message} <button onClick={syncNow} disabled={syncing}>Thử lại</button></div>}
    {loading ? <div className="pw-loading"><Loader2 className="animate-spin" size={21} />Đang đồng bộ…</div> : <div className="pw-groups">{groups.map((g) => {
      const rows = g.records.filter(matches)
      if (!rows.length && (search || state !== 'all' || scope !== 'all')) return null
      const open = expanded[g.id] ?? Boolean(search || state !== 'all' || scope !== 'all')
      const spent = g.records.reduce((n, row) => n + paymentTotal(byItem[row.id] || []), 0)
      return <section className="pw-group" key={g.id} style={{ '--group-accent': ['#6caeff','#54d8bc','#f3b869','#b49aff','#ef91bb','#78cddd'][Array.from(g.id).reduce((sum, c) => sum + c.codePointAt(0), 0) % 6] }}><button className="pw-group-header" aria-expanded={open} onClick={() => setExpanded((prev) => ({ ...prev, [g.id]: !open }))}><span className="pw-group-icon"><GroupIcon name={g.icon} /></span><span className="pw-group-name"><strong>{g.name}</strong>{task ? <small>{g.records.length ? `${g.records.filter((t) => t.status === 'done').length} hoàn thành · ${g.records.length} công việc` : 'Thêm công việc đầu tiên cho nhóm'}</small> : <small className="pw-spent"><Banknote size={15} aria-hidden="true" />Đã chi {money(spent)}</small>}</span><span className="pw-count">{task ? `${g.records.filter((t) => t.status === 'done').length}/${g.records.length}` : `${g.records.length} khoản`}</span>{open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>{open && <div><div className={`pw-group-columns ${task ? '' : 'budget'}`}><span>{task ? 'Công việc' : 'Khoản chi'}</span><span>{task ? 'Phụ trách' : 'Dự toán'}</span><span>{task ? 'Trạng thái' : 'Thực chi'}</span><span>{task ? 'Ưu tiên' : 'Thanh toán'}</span>{task && <span>Hạn hoàn thành</span>}</div>{rows.map((row) => {
        const actual = paymentTotal(byItem[row.id] || [])
        const st = task ? row.status : paymentState(row, actual)
        return <article key={row.id} className={`pw-record ${task ? '' : 'budget'}`} role="button" tabIndex={0} aria-label={`Mở ${task ? row.title : row.name}`} onClick={() => openRecord(row)} onKeyDown={(e) => { if (e.target === e.currentTarget && ['Enter',' '].includes(e.key)) { e.preventDefault(); openRecord(row) } }}><div className="pw-row-title">{task ? <button className={`pw-check ${row.status === 'done' ? 'checked' : ''}`} disabled={busy} aria-label={`${row.status === 'done' ? 'Mở lại' : 'Hoàn thành'} ${row.title}`} onClick={(e) => { e.stopPropagation(); toggleTask(row) }}>{row.status === 'done' && <Check size={15} />}</button> : <Wallet size={21} color="#9dbbdf" />}<div><strong className={task && row.status === 'done' ? 'pw-complete' : ''}>{task ? row.title : row.name}</strong>{!task && <small className="pw-row-money">Dự toán {compact(row.planned)}<span className="pw-spent"><Banknote size={14} aria-hidden="true" />Đã chi {compact(actual)}</span></small>}<div className="pw-mobile-meta">{task && <span className="pw-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span>{personName(row.assignee) || 'Chưa giao'}</span>}<Pill value={st}>{task ? taskStates[st] || st : budgetStates[st]}</Pill>{task && row.deadline && <span className={`pw-row-date ${isOverdue(row) ? 'overdue' : ''}`}>{date(row.deadline)}</span>}</div></div></div>{task ? <><span className="pw-owner"><span className="pw-avatar">{personName(row.assignee).slice(0,1) || '—'}</span>{personName(row.assignee) || 'Chưa giao'}</span><Pill value={st}>{taskStates[st] || st}</Pill><Pill value={row.priority}>{priorities[row.priority] || row.priority}</Pill><span className={`pw-row-date ${isOverdue(row) ? 'overdue' : ''}`}>{date(row.deadline)}</span></> : <><span className="pw-amount">{money(row.planned)}</span><span className="pw-amount">{money(actual)}</span><Pill value={st}>{budgetStates[st]}</Pill></>}</article>
      })}{!rows.length && <div className="pw-empty">Nhóm chưa có {task ? 'công việc' : 'khoản chi'}.</div>}<button className="pw-add-row" onClick={() => openNew(g.id)}><Plus size={16} />{task ? 'Thêm việc vào nhóm' : 'Thêm khoản chi'}</button></div>}</section>
    })}{!groups.length && <div className="pw-empty">Tạo nhóm đầu tiên để bắt đầu.</div>}{groups.length > 0 && !groups.some((g) => g.records.some(matches) || (!g.records.length && !search && scope === 'all' && state === 'all')) && <div className="pw-empty">Không có bản ghi phù hợp.</div>}</div>}
    <PlanningNav />

    <PlanningPanel open={Boolean(draft)} title={task ? (draft?.updated_at ? 'Chi tiết công việc' : 'Thêm công việc') : (draft?.updated_at ? 'Sửa khoản ngân sách' : 'Thêm khoản ngân sách')} busy={disabled} onClose={() => setDraft(null)} wide footer={<><button className="pw-secondary" disabled={disabled} onClick={() => setDraft(null)}>Đóng</button><BusyButton busy={disabled} type="submit" form="planning-record-form">Lưu thay đổi</BusyButton></>}>
      {draft && <form id="planning-record-form" className="pw-edit-form" onSubmit={saveRecord}><div className="pw-form-grid"><Field label={task ? 'Tên công việc *' : 'Tên khoản ngân sách *'} full><input required maxLength={300} value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder={task ? 'Ví dụ: Lắp hệ thống hút khói' : 'Ví dụ: Thi công mặt bằng'} /></Field><Field label="Nhóm *"><select required value={draft.group} onChange={(e) => set('group', e.target.value)}><option value="">Chọn nhóm</option>{allGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field><Field label=""><button type="button" className="pw-secondary" onClick={openGroupManager}><Plus size={17} />Tạo / sửa nhóm</button></Field>{task ? <><Field label="Người phụ trách"><select value={draft.assignee || ''} onChange={(e) => set('assignee', e.target.value)}><option value="">Chưa giao</option>{names.map((n) => <option key={n} value={n}>{personName(n)}</option>)}<option value="Cả hai">Cả hai</option></select></Field><Field label="Trạng thái"><select value={draft.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(taskStates).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Ưu tiên"><select value={draft.priority} onChange={(e) => set('priority', e.target.value)} data-tone={draft.priority}>{Object.entries(priorities).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Hạn hoàn thành"><input type="date" value={draft.deadline || ''} onChange={(e) => set('deadline', e.target.value)} /></Field><Field label="Khoản ngân sách liên quan" full><select value={draft.linked_budget_id || ''} onChange={(e) => set('linked_budget_id', e.target.value)}><option value="">Chưa liên kết</option>{budgets.rows.map((b) => <option key={b.id} value={b.id}>{b.name} · Đã chi {money(paymentTotal(byItem[b.id] || []))}</option>)}</select></Field><Field label="Ghi chú" full><textarea maxLength={10000} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Nội dung trao đổi, yêu cầu nghiệm thu…" /></Field></> : <><Field label="Dự toán (đ) *"><input required inputMode="numeric" value={draft.planned} onChange={(e) => set('planned', e.target.value.replace(/\D/g,''))} placeholder="0" /></Field><Field label="Giá trị chốt (đ) · không bắt buộc"><input inputMode="numeric" value={draft.agreed_amount} onChange={(e) => set('agreed_amount', e.target.value.replace(/\D/g,''))} placeholder="Để trống nếu chưa chốt" /></Field><Field label="Người phụ trách"><select value={draft.owner || ''} onChange={(e) => set('owner', e.target.value)}><option value="">Chưa giao</option>{names.map((n) => <option key={n} value={n}>{personName(n)}</option>)}<option value="Cả hai">Cả hai</option></select></Field><Field label="Thanh toán"><select value={draft.status} onChange={(e) => set('status', e.target.value)}>{Object.entries(budgetStates).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Ghi chú" full><textarea maxLength={10000} value={draft.note} onChange={(e) => set('note', e.target.value)} /></Field><p className="pw-muted full">Thực chi được tính từ các lần thanh toán. Người phụ trách có thể khác người trả tiền.</p></>}</div>{task && draft.linked_budget_id && draft.updated_at && <section className="pw-section"><button type="button" className="pw-link-box" disabled={disabled} onClick={() => navigate(`/budget?item=${draft.linked_budget_id}`)}><LinkIcon size={17} />Mở khoản ngân sách liên quan</button></section>}<section className="pw-section"><h3>Tệp đính kèm</h3><Attachments value={draft.attachments} onChange={(v) => set('attachments', v)} disabled={busy} onBusy={setUploading} /></section>{draft.updated_at && <History events={currentHistory} />}{formError && <p className="pw-error" role="alert">{formError}</p>}{draft.updated_at && <section className="pw-section"><button type="button" className="pw-secondary pw-danger" disabled={disabled} onClick={() => setConfirm({ type: 'delete', row: draft })}><Trash2 size={16} />Xóa {task ? 'công việc' : 'khoản ngân sách'}</button></section>}</form>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(detail) && !task} title="Chi tiết khoản chi" busy={disabled} onClose={() => setDetailId(null)} wide footer={<><button className="pw-secondary" disabled={disabled} onClick={() => editRecord(detail)}><Pencil size={16} />Chỉnh sửa</button><BusyButton busy={busy} onClick={() => openPayment()}><Plus size={18} />Ghi nhận chi</BusyButton></>}>
      {detail && <><div className="pw-detail-heading"><div><h3>{detail.name}</h3><p>{detail.category || 'Chưa phân nhóm'}</p></div><Pill value={paymentState(detail,detailActual)}>{budgetStates[paymentState(detail,detailActual)]}</Pill></div><div className="pw-detail-grid"><div><div className="pw-detail-summary"><SummaryLine label="Dự toán" value={money(detail.planned)} /><SummaryLine label="Giá trị chốt" value={detail.agreed_amount == null ? 'Chưa chốt' : money(detail.agreed_amount)} /><SummaryLine label="Đã thanh toán" value={money(detailActual)} />{detail.agreed_amount != null && <SummaryLine label={detailActual > detail.agreed_amount ? 'Chi vượt giá trị chốt' : 'Còn thanh toán'} value={money(Math.abs(detail.agreed_amount - detailActual))} />}</div><p className="pw-muted">{detail.owner ? `Phụ trách: ${personName(detail.owner)}` : 'Chưa giao người phụ trách'}</p><section className="pw-section"><h3>Ghi chú</h3><p className="pw-muted" style={{ whiteSpace: 'pre-wrap' }}>{detail.note || 'Chưa có ghi chú.'}</p></section><section className="pw-section"><h3>Tệp đính kèm</h3><Attachments value={detail.attachments} /></section><section className="pw-section"><h3>Công việc liên quan</h3>{tasks.rows.filter((t) => t.linked_budget_id === detailId).map((t) => <div key={t.id} className="pw-link-box"><LinkIcon size={16} /><span>{t.title}</span><Pill value={t.status}>{taskStates[t.status]}</Pill></div>)}{!tasks.rows.some((t) => t.linked_budget_id === detailId) && <p className="pw-muted">Chưa liên kết công việc.</p>}</section></div><div><h3 style={{ fontSize: 15, marginBottom: 12 }}>Các lần thanh toán</h3>{detailPayments.map((p) => {
        const payer = members.rows.find((m) => m.id === p.payer_id)
        const label = payer ? personName(payer.name) : 'Chưa xác định người trả'
        return <div className={`pw-payment ${p.voided_at ? 'void' : ''}`} key={p.id}><span className="pw-avatar">{payer ? label.slice(0,1) : '?'}</span><div className="pw-payment-body"><div className="pw-payment-top"><span>{label}</span><strong>{money(p.amount)}</strong></div><p>{p.note || 'Không có nội dung'}</p><small>{date(p.spent_at)}{p.voided_at ? ` · Đã hủy: ${p.void_reason}` : ''}</small><Attachments value={p.attachments} />{!p.voided_at && <div className="pw-payment-actions">{p.amount > 0 && <button onClick={() => openPayment(p)}><Pencil size={12} style={{ display:'inline', marginRight:4 }} />{payer ? 'Sửa khoản chi' : 'Bổ sung người trả / sửa'}</button>}<button className="pw-danger" onClick={() => { setVoidReason(''); setConfirm({ type: 'void', row: p }) }}>Hủy khoản chi</button></div>}</div></div>
      })}{!detailPayments.length && <p className="pw-muted">Chưa ghi nhận thanh toán.</p>}<History events={selectedHistory} /></div></div></>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(payment)} title={payment?.updated_at ? 'Sửa khoản chi' : 'Ghi nhận chi'} busy={disabled} onClose={() => setPayment(null)} footer={<><button className="pw-secondary" disabled={disabled} onClick={() => setPayment(null)}>Đóng</button><BusyButton busy={disabled} form="planning-payment-form" type="submit">Lưu khoản chi</BusyButton></>}>
      {payment && <form id="planning-payment-form" className="pw-edit-form pw-payment-form" onSubmit={savePayment}><div className="pw-payment-context"><strong>{budgets.rows.find((b) => b.id === payment.item_id)?.name}</strong><small>Ghi nhận số tiền đã thanh toán thực tế</small></div><div className="pw-form-grid"><Field label="Người trả *"><select required value={payment.payer_id} onChange={(e) => setPayment((p) => ({ ...p, payer_id: e.target.value }))}><option value="">Chọn người trả</option>{members.rows.map((m) => <option key={m.id} value={m.id}>{personName(m.name)}</option>)}</select></Field><Field label="Số tiền (đ) *"><input required inputMode="numeric" value={payment.amount} onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value.replace(/\D/g,'') }))} placeholder="0" /></Field><Field label="Ngày thanh toán *"><input required type="date" value={payment.spent_at} onChange={(e) => setPayment((p) => ({ ...p, spent_at: e.target.value }))} /></Field><Field label="Nội dung" full><textarea maxLength={10000} value={payment.note} onChange={(e) => setPayment((p) => ({ ...p, note: e.target.value }))} placeholder="Ví dụ: Cọc thi công đợt 1" /></Field></div><section className="pw-section"><h3>Ảnh hóa đơn / tệp</h3><Attachments value={payment.attachments} onChange={(v) => setPayment((p) => ({ ...p, attachments: v }))} onBusy={setUploading} disabled={busy} /></section><p className="pw-muted" style={{ marginTop:18 }}>Tổng chi tự cập nhật sau khi lưu.</p>{paymentError && <p className="pw-error" role="alert">{paymentError}</p>}</form>}
    </PlanningPanel>

    <PlanningPanel open={groupOpen} title="Quản lý nhóm" onClose={() => setGroupOpen(false)} busy={busy} footer={<><button className="pw-secondary" disabled={busy} onClick={() => setGroupDraft({ id: crypto.randomUUID(), name:'', icon:'folder' })}>Nhóm mới</button><BusyButton busy={busy} form="planning-group-form" type="submit">{groupDraft?.created_at ? 'Lưu nhóm' : 'Tạo nhóm'}</BusyButton></>}>
      <p className="pw-muted" style={{ marginBottom:16 }}>Nhóm dùng chung cho công việc và ngân sách. Nhóm mới tự xuất hiện trong danh sách chọn.</p><div className="pw-group-manager-list">{categories.rows.map((g) => <button key={g.id} onClick={() => { setGroupDraft(g); setGroupError('') }}><GroupIcon name={g.icon} /><span>{g.name}</span><Pencil size={13} /></button>)}</div>{groupDraft && <form id="planning-group-form" className="pw-edit-form pw-group-form" onSubmit={saveGroup}><div className="pw-form-grid"><Field label="Tên nhóm *" full><input required maxLength={120} value={groupDraft.name} onChange={(e) => setGroupDraft((g) => ({ ...g, name:e.target.value }))} placeholder="Ví dụ: Mặt bằng & thi công" /></Field><Field label="Biểu tượng" full><div className="pw-icon-grid">{Object.keys(groupIcons).map((key) => <button type="button" aria-pressed={groupDraft.icon === key} key={key} className={groupDraft.icon === key ? 'selected' : ''} onClick={() => setGroupDraft((g) => ({ ...g, icon:key }))}><GroupIcon name={key} /><span>{iconNames[key]}</span></button>)}</div></Field></div>{groupError && <p className="pw-error" role="alert">{groupError}</p>}</form>}
    </PlanningPanel>

    <PlanningPanel open={Boolean(confirm)} title={confirm?.type === 'void' ? 'Hủy khoản chi' : 'Xóa bản ghi'} busy={busy} onClose={() => setConfirm(null)} footer={<><button className="pw-secondary" disabled={busy} onClick={() => setConfirm(null)}>Quay lại</button><BusyButton busy={busy} type="submit" form="planning-confirm-form">Xác nhận</BusyButton></>}>
      {confirm && <form id="planning-confirm-form" onSubmit={confirmAction}>{confirm.type === 'void' ? <><p className="pw-muted" style={{ marginBottom:18 }}>Khoản chi {money(confirm.row.amount)} sẽ không tính vào tổng. Bản ghi và lý do hủy vẫn được giữ để tra cứu.</p><Field label="Lý do hủy *"><textarea required maxLength={1000} value={voidReason} onChange={(e) => setVoidReason(e.target.value)} /></Field></> : <p className="pw-muted">Xóa “{confirm.row.title || confirm.row.name}”? Khoản ngân sách đã có thanh toán không thể xóa để bảo toàn lịch sử.</p>}</form>}
    </PlanningPanel>
  </div>
}

function SummaryLine({ label, value }) { return <div className="pw-summary-line"><span>{label}</span><strong>{value}</strong></div> }
