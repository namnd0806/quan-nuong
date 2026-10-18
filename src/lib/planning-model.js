import { isOverdue } from './data-flow.js'

export const taskStates = { todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ xử lý', paused: 'Tạm dừng', done: 'Hoàn thành', overdue: 'Quá hạn' }
export const priorities = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' }
export const budgetStates = { pending: 'Chưa chi', partial: 'Đã cọc / Một phần', paid: 'Đã thanh toán' }
export const personKey = (name) => String(name || '').replace(/\s*\(Bạn\)/gi, '').trim().toLocaleLowerCase('vi').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd')
export const personName = (name) => String(name || '').replace(/\s*\(Bạn\)/gi, '').trim().replace(/^./, (c) => c.toUpperCase())
export const validMoney = (value) => Number.isSafeInteger(Number(value)) && Number(value) >= 0 && String(value).trim() !== ''
export const activePayments = (payments) => payments.filter((p) => !p.voided_at)
export const paymentTotal = (payments) => activePayments(payments).reduce((sum, p) => sum + Number(p.amount || 0), 0)

export function budgetPaymentState(item, actual) {
  const paid = Number(actual || 0)
  const agreed = item?.agreed_amount
  const target = agreed !== null && agreed !== undefined && agreed !== '' ? Number(agreed) : Number(item?.planned || 0)
  if (paid <= 0) return 'pending'
  if (target > 0 && paid >= target) return 'paid'
  return 'partial'
}

export function spendingSummary(items, payments, members) {
  const active = activePayments(payments)
  return {
    planned: items.reduce((sum, item) => sum + Number(item.planned || 0), 0),
    actual: paymentTotal(active),
    people: members.map((m) => ({ ...m, spent: active.filter((p) => p.payer_id === m.id).reduce((sum, p) => sum + Number(p.amount || 0), 0) })),
    unassigned: active.filter((p) => !p.payer_id).reduce((sum, p) => sum + Number(p.amount || 0), 0),
  }
}

export function planningGroups(categories, rows, kind) {
  const key = kind === 'tasks' ? 'dept' : 'category'
  const groups = categories.map((c) => ({ ...c, records: [] }))
  for (const row of rows) {
    let g = groups.find((g) => row.category_id ? g.id === row.category_id : g.name === row[key])
    if (!g) {
      const name = row[key] || 'Chưa phân nhóm'
      g = groups.find((g) => g.id === `legacy:${name}`)
      if (!g) { g = { id: `legacy:${name}`, name, icon: 'folder', legacy: true, records: [] }; groups.push(g) }
    }
    g.records.push(row)
  }
  return groups
}

export function taskMatches(task, { search = '', scope = 'all', state = 'all', me = '' }) {
  if (search && ![task.title, task.description, task.assignee, task.dept].join(' ').toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))) return false
  if (scope === 'mine' && ![personKey(me), personKey('Cả hai')].includes(personKey(task.assignee))) return false
  if (scope === 'both' && personKey(task.assignee) !== personKey('Cả hai')) return false
  if (state === 'overdue') return isOverdue(task)
  return state === 'all' || task.status === state
}

export function attachmentList(value) {
  if (!Array.isArray(value)) return []
  return value.filter((a) => a && typeof a === 'object' && (a.path || /^https:\/\//.test(a.url || '')))
}
