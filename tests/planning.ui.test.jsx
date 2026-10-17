import React from 'react'
import { beforeAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlanningWorkspace from '../src/components/planning/PlanningWorkspace'

const mocks = vi.hoisted(() => ({ collections: {}, rpc: vi.fn(), success: vi.fn(), error: vi.fn() }))
vi.mock('@/hooks/useCollection', () => ({ useCollection: (table) => mocks.collections[table] }))
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile: { name:'nam' }, user: { email:'nam@quannuong.app' } }) }))
vi.mock('@/components/ui/toast', () => ({ useToast: () => ({ success:mocks.success, error:mocks.error }) }))
vi.mock('@/lib/supabase', () => ({ supabase: { rpc: mocks.rpc, storage: { from: () => ({ createSignedUrl: vi.fn().mockResolvedValue({data:{signedUrl:'https://example.com/file.pdf'}}) }) } } }))
beforeAll(() => {
 HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
 HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
beforeEach(() => {
 vi.clearAllMocks()
 const fixtures = {
  main_categories:[{id:'group-1',name:'Mặt bằng & thi công',icon:'tools',sort:1}],
  members:[{id:'nam',name:'Nam (Bạn)'},{id:'phuong',name:'Phương'}],
  checklist_tasks:[{id:'task-1',title:'Lắp hút khói',dept:'Mặt bằng & thi công',category_id:'group-1',assignee:'Nam (Bạn)',status:'doing',priority:'high',deadline:'2026-10-20',updated_at:'2026-10-17T10:00:00Z',attachments:[]}],
  budget_items:[{id:'budget-1',name:'Thi công',category:'Mặt bằng & thi công',category_id:'group-1',planned:100,agreed_amount:90,status:'partial',updated_at:'2026-10-17T10:00:00Z',attachments:[]}],
  budget_transactions:[{id:'p1',item_id:'budget-1',amount:20,payer_id:'nam',spent_at:'2026-10-17'},{id:'p2',item_id:'budget-1',amount:10,payer_id:'phuong',spent_at:'2026-10-17'},{id:'p3',item_id:'budget-1',amount:5,payer_id:null,spent_at:'2026-10-17'},{id:'p4',item_id:'budget-1',amount:99,payer_id:'nam',voided_at:'2026-10-17',spent_at:'2026-10-17',void_reason:'Sai'}],
  workspace_events:[],
 }
 for(const [table,rows] of Object.entries(fixtures)) mocks.collections[table]={rows,loading:false,error:null,refetch:vi.fn().mockResolvedValue(),create:vi.fn().mockResolvedValue(),update:vi.fn().mockResolvedValue(),remove:vi.fn().mockResolvedValue()}
 mocks.rpc.mockResolvedValue({data:{},error:null})
})
afterEach(cleanup)
const mount = (kind, path='/') => render(<MemoryRouter initialEntries={[path]}><PlanningWorkspace kind={kind}/></MemoryRouter>)

describe('Checklist and Budget interactions', () => {
 it('opens a task by its whole row and saves editable values to the backend contract', async () => {
  mount('tasks')
  fireEvent.click(screen.getByRole('button',{name:'Mở Lắp hút khói'}))
  const dialog=screen.getByRole('dialog',{name:'Chi tiết công việc'})
  fireEvent.change(within(dialog).getByLabelText('Trạng thái'),{target:{value:'waiting'}})
  fireEvent.change(within(dialog).getByLabelText('Ghi chú'),{target:{value:'Chờ nghiệm thu'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Lưu thay đổi'}))
  await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith('save_planning_record',expect.objectContaining({p_kind:'tasks',p_id:'task-1',p_expected:'2026-10-17T10:00:00Z',p_values:expect.objectContaining({status:'waiting',description:'Chờ nghiệm thu',category_id:'group-1'})})))
 })
 it('shows totals and each payer, excluding cancelled payments, and saves a new payment', async () => {
  mount('budget')
  expect(within(screen.getByText('Tổng thực chi').parentElement).getByText('35đ')).toBeTruthy()
  expect(within(screen.getByText('Nam đã chi').parentElement).getByText('20đ')).toBeTruthy()
  expect(screen.getByText(/Còn 5đ chưa xác định/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button',{name:'Mở Thi công'}))
  fireEvent.click(within(screen.getByRole('dialog',{name:'Chi tiết khoản chi'})).getByRole('button',{name:'Ghi nhận chi'}))
  const dialog=screen.getByRole('dialog',{name:'Ghi nhận chi'})
  fireEvent.change(within(dialog).getByLabelText('Người trả *'),{target:{value:'phuong'}})
  fireEvent.change(within(dialog).getByLabelText('Số tiền (đ) *'),{target:{value:'20000000'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Lưu khoản chi'}))
  await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith('save_payment',expect.objectContaining({p_expected:null,p_values:expect.objectContaining({item_id:'budget-1',payer_id:'phuong',amount:20000000})})))
 })
 it('keeps the form open and reports backend conflicts instead of pretending to save', async () => {
  mocks.rpc.mockResolvedValue({error:{message:'Công việc vừa được sửa ở thiết bị khác.'}})
  mount('tasks')
  fireEvent.click(screen.getByRole('button',{name:'Mở Lắp hút khói'}))
  fireEvent.click(within(screen.getByRole('dialog',{name:'Chi tiết công việc'})).getByRole('button',{name:'Lưu thay đổi'}))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent','Công việc vừa được sửa ở thiết bị khác.')
  expect(mocks.success).not.toHaveBeenCalled()
 })
 it('creates a configured group with an explicit icon', async () => {
  mount('tasks')
  fireEvent.click(screen.getByRole('button',{name:'Quản lý nhóm'}))
  const dialog=screen.getByRole('dialog',{name:'Quản lý nhóm'})
  fireEvent.change(within(dialog).getByLabelText('Tên nhóm *'),{target:{value:'Thiết bị'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Thiết bị'}))
  fireEvent.click(within(dialog).getByRole('button',{name:'Tạo nhóm'}))
  await waitFor(()=>expect(mocks.collections.main_categories.create).toHaveBeenCalledWith(expect.objectContaining({name:'Thiết bị',icon:'equipment'})))
 })
 it('requires a cancellation reason and calls the void RPC rather than deleting payment history', async () => {
  mount('budget','/budget?item=budget-1')
  const details=screen.getByRole('dialog',{name:'Chi tiết khoản chi'})
  fireEvent.click(within(details).getAllByRole('button',{name:'Hủy khoản chi'})[0])
  const dialog=screen.getByRole('dialog',{name:'Hủy khoản chi'})
  fireEvent.change(within(dialog).getByLabelText('Lý do hủy *'),{target:{value:'Ghi nhầm'}})
  fireEvent.click(within(dialog).getByRole('button',{name:'Xác nhận'}))
  await waitFor(()=>expect(mocks.rpc).toHaveBeenCalledWith('void_payment',expect.objectContaining({p_id:'p1',p_reason:'Ghi nhầm'})))
 })
})
