import test from 'node:test'
import assert from 'node:assert/strict'
import { spendingSummary, paymentTotal, planningGroups, taskMatches, validMoney, budgetPaymentState } from '../src/lib/planning-model.js'

test('spending reports each payer and preserves unassigned legacy payments without comparing people', () => {
 const payments = [{ amount:20,payer_id:'nam' },{ amount:10,payer_id:'phuong' },{ amount:8,payer_id:null },{ amount:99,payer_id:'nam',voided_at:'2026-10-17' }]
 const result = spendingSummary([{ planned:100 }],payments,[{id:'nam'},{id:'phuong'}])
 assert.equal(result.actual,38)
 assert.equal(result.people[0].spent,20)
 assert.equal(result.people[1].spent,10)
 assert.equal(result.unassigned,8)
 assert.equal(result.people.reduce((s,p)=>s+p.spent,0)+result.unassigned,result.actual)
 assert.equal(paymentTotal([{amount:10},{amount:-3}]),7)
})
test('configured empty groups and historic records remain accessible', () => {
 const groups = planningGroups([{id:'a',name:'New'}],[{id:'t1',dept:'Old'},{id:'t2',dept:'New',category_id:'a'}],'tasks')
 assert.equal(groups.length,2)
 assert.equal(groups[0].records[0].id,'t2')
 assert.equal(groups[1].records[0].id,'t1')
})
test('my tasks recognizes legacy member labels and shared work', () => {
 assert.equal(taskMatches({assignee:'Nam (Bạn)',status:'todo'},{scope:'mine',me:'nam'}),true)
 assert.equal(taskMatches({assignee:'Cả hai',status:'todo'},{scope:'mine',me:'nam'}),true)
 assert.equal(taskMatches({assignee:'Phương',status:'todo'},{scope:'mine',me:'nam'}),false)
 assert.equal(taskMatches({assignee:'Phương',status:'todo'},{scope:'mine',me:'phuong'}),true)
})
test('money validation rejects negative, fractional, missing and unsafe values', () => {
 for(const value of [-1,1.2,'',NaN,Infinity,9007199254740992]) assert.equal(validMoney(value),false)
 for(const value of [0,'20000000']) assert.equal(validMoney(value),true)
})

test('budget status is derived from real payments instead of stale manual status', () => {
 assert.equal(budgetPaymentState({ planned:99,status:'paid' },0),'pending')
 assert.equal(budgetPaymentState({ planned:99 },20),'partial')
 assert.equal(budgetPaymentState({ planned:99 },99),'paid')
 assert.equal(budgetPaymentState({ planned:120,agreed_amount:90 },90),'paid')
})
