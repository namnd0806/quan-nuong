import React from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatVND, cn } from '@/lib/utils'

const STATUS = {
  paid: { label: 'Đã thanh toán', variant: 'success' },
  partial: { label: 'Thanh toán một phần', variant: 'info' },
  over: { label: 'Vượt dự toán', variant: 'destructive' },
  pending: { label: 'Chờ thanh toán', variant: 'warning' },
}

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return '—' }
}

function SectionTitle({ children }) {
  return <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400">{children}</h3>
}
function Field({ label, children }) {
  return (
    <div className="flex gap-4 py-2 text-sm">
      <span className="w-32 shrink-0 text-gray-400">{label}</span>
      <span className="flex-1 text-foreground">{children}</span>
    </div>
  )
}

// expense: { ...item, icon, actual, displayStatus, transactions }
export default function ExpenseDetailPanel({ expense, onClose, onEdit, onDelete, onRecord }) {
  const planned = expense?.planned || 0
  const actual = expense?.actual || 0
  const diff = actual - planned
  const ratio = planned > 0 ? (actual / planned) * 100 : 0
  const st = STATUS[expense?.displayStatus] || STATUS.pending
  const txs = expense?.transactions || []

  return (
    <Dialog open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="3xl" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-3xl shadow-lg">
              {expense?.icon}
            </div>
            <div className="flex-1">
              <DialogTitle>{expense?.name}</DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-gray-400">{expense?.category}</span>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <SectionTitle>Thông tin chung</SectionTitle>
                <Field label="Hạng mục">
                  <span className="inline-flex items-center gap-1.5">{expense?.icon} {expense?.category || '—'}</span>
                </Field>
                <Field label="Khoản chi">{expense?.name}</Field>
                <Field label="Người phụ trách">
                  {expense?.owner ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-[10px] font-semibold text-white">
                          {expense.owner.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {expense.owner}
                    </span>
                  ) : '—'}
                </Field>
              </div>

              <div>
                <SectionTitle>Ngân sách</SectionTitle>
                <div className="space-y-3 rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dự toán</span>
                    <span className="font-medium text-foreground">{formatVND(planned)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Thực chi</span>
                    <span className="font-medium text-foreground">{formatVND(actual)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Chênh lệch</span>
                    <span className={cn('font-medium', diff > 0 ? 'text-red-400' : 'text-emerald-400')}>
                      {diff > 0 ? '+' : ''}{formatVND(diff)}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tỷ lệ</span>
                      <span className="font-medium text-foreground">{ratio.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(ratio, 100)} indicatorClassName={ratio > 100 ? 'bg-red-500' : 'bg-emerald-500'} />
                  </div>
                </div>
              </div>

              {expense?.note && (
                <div>
                  <SectionTitle>Ghi chú</SectionTitle>
                  <p className="rounded-xl border border-white/10 p-4 text-sm text-gray-300" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {expense.note}
                  </p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle className="mb-0">Lịch sử chi ({txs.length})</SectionTitle>
                <button onClick={() => onRecord(expense)} className="flex items-center gap-1 text-xs text-blue-400 transition-colors hover:text-blue-300">
                  <Plus className="h-3 w-3" /> Ghi nhận chi
                </button>
              </div>
              {txs.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-400">
                  Chưa có giao dịch chi nào
                </div>
              ) : (
                <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                  {txs.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/10 p-4 transition-colors hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{formatVND(t.amount)}</p>
                        {t.note && <p className="mt-0.5 text-xs text-gray-400">{t.note}</p>}
                      </div>
                      <span className="ml-3 text-xs text-gray-400">{fmtDate(t.spent_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onDelete(expense)} className="rounded-xl border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20">
            <Trash2 className="h-4 w-4" /> Xóa
          </Button>
          <Button className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30" onClick={() => onEdit(expense)}>
            <Pencil className="h-4 w-4" /> Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
