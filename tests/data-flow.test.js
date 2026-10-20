import test from 'node:test'
import assert from 'node:assert/strict'
import { localDate, isOverdue, categoryOptions, variableCostTotal, totalMenuCost } from '../src/lib/data-flow.js'
import { formatCompactVND, formatVND } from '../src/lib/utils.js'

test('Vietnam dates cross midnight before UTC and overdue excludes completed tasks', () => {
  const today = localDate(new Date('2026-10-16T18:00:00Z'))
  assert.equal(today, '2026-10-17')
  assert.equal(isOverdue({ status: 'doing', deadline: '2026-10-16' }, today), true)
  assert.equal(isOverdue({ status: 'done', deadline: '2026-10-16' }, today), false)
  assert.equal(isOverdue({ status: 'todo', deadline: today }, today), false)
})

test('configured and historic categories remain selectable without duplicates', () => {
  assert.deepEqual(categoryOptions([{ name: 'New group' }], ['Old group', 'New group', null], ['Default']), ['New group', 'Old group'])
})

test('menu totals include variable costs with safe legacy fallback', () => {
  assert.equal(totalMenuCost({ cost: 30000, variable_costs: [{ name: 'Sauce', cost: 5000 }, { cost: '2000' }] }), 37000)
  assert.equal(variableCostTotal({ variable_cost: 3000 }), 3000)
  assert.equal(variableCostTotal({ variable_cost: 3000, variable_costs: [] }), 0)
})

test('VND display rounds to the nearest thousand and never shows sub-thousand units', () => {
  assert.equal(formatCompactVND(13_000_000), '13tr')
  assert.equal(formatCompactVND(1_862_000), '1tr862k')
  assert.equal(formatCompactVND(1_886_200), '1tr886k')
  assert.equal(formatCompactVND(999_999), '1tr')
  assert.equal(formatCompactVND(500_000), '500k')
  assert.equal(formatCompactVND(448_188), '448k')
  assert.equal(formatCompactVND(72_556_888), '72tr557k')
  assert.equal(formatCompactVND(20), '1k')
  assert.equal(formatVND(92_676_888), '92.677.000đ')
})
