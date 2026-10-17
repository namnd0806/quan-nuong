// Shared rules used by Checklist, Dashboard and Budget.
export function localDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  return ['year', 'month', 'day'].map((key) => parts.find((part) => part.type === key).value).join('-')
}

export function isOverdue(task, today = localDate()) {
  return task.status !== 'done' && (task.status === 'overdue' || Boolean(task.deadline && task.deadline < today))
}

export function categoryOptions(configured, existing, defaults = []) {
  return [...new Set([...(configured.length ? configured.map((row) => row.name) : defaults), ...existing].filter(Boolean))]
}

export function variableCostTotal(item) {
  return Array.isArray(item.variable_costs)
    ? item.variable_costs.reduce((sum, row) => sum + (Number(row.cost) || 0), 0)
    : Number(item.variable_cost) || 0
}

export function totalMenuCost(item) {
  return (Number(item.cost) || 0) + variableCostTotal(item)
}
