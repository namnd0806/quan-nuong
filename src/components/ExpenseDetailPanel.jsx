import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2, Plus, Clock } from 'lucide-react'
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
  return <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>
}
function Field({ label, children }) {
  return (
    <div className="flex gap-4 py-2 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1 text-foreground">{children}</span>
    </div>
  )
}

// expense: { ...item, icon, actual, displayStatus, transactions }
export default function ExpenseDetailPanel({ expense, onClose, onEdit, onDelete, onRecord }) {
  return (
    <AnimatePresence>
      {expense && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            key={expense.id}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-border bg-card shadow-2xl"
          >
            <PanelBody e={expense} onClose={onClose} onEdit={onEdit} onDelete={onDelete} onRecord={onRecord} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelBody({ e, onClose, onEdit, onDelete, onRecord }) {
  const planned = e.planned || 0
  const actual = e.actual || 0
  const diff = actual - planned
  const ratio = planned > 0 ? (actual / planned) * 100 : 0
  const st = STATUS[e.displayStatus] || STATUS.pending
  const txs = e.transactions || []

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-xl text-foreground">Chi tiết khoản chi</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="flex items-center gap-3 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-2xl">{e.icon}</div>
          <div>
            <div className="font-semibold text-foreground">{e.name}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{e.category}</span>
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
          </div>
        </div>

        <SectionTitle>Thông tin chung</SectionTitle>
        <Field label="Hạng mục"><span className="inline-flex items-center gap-1.5">{e.icon} {e.category || '—'}</span></Field>
        <Field label="Khoản chi">{e.name}</Field>
        <Field label="Người phụ trách">
          {e.owner ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar className="h-5 w-5"><AvatarFallback className="text-[10px]">{e.owner.charAt(0)}</AvatarFallback></Avatar>
              {e.owner}
            </span>
          ) : '—'}
        </Field>

        <SectionTitle>Ngân sách</SectionTitle>
        <div className="flex justify-between py-2 text-sm">
          <span className="text-muted-foreground">Dự toán</span>
          <span className="font-medium text-foreground">{formatVND(planned)}</span>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <span className="text-muted-foreground">Thực chi</span>
          <span className="font-medium text-foreground">{formatVND(actual)}</span>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <span className="text-muted-foreground">Chênh lệch</span>
          <span className={cn('font-medium', diff > 0 ? 'text-destructive' : 'text-success')}>{diff > 0 ? '+' : ''}{formatVND(diff)}</span>
        </div>
        <div className="py-2">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tỷ lệ</span>
            <span className="font-medium text-foreground">{ratio.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(ratio, 100)} indicatorClassName={ratio > 100 ? 'bg-destructive' : 'bg-success'} />
        </div>

        <div className="mb-2 mt-6 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lịch sử chi ({txs.length})</h3>
          <button onClick={() => onRecord(e)} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus className="h-3 w-3" /> Ghi nhận chi</button>
        </div>
        {txs.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Chưa có giao dịch chi nào.</p>
        ) : (
          <div className="space-y-3 py-2">
            {txs.map((t) => (
              <div key={t.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"><Clock className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground"><span className="font-medium">{formatVND(t.amount)}</span>{t.note ? ` — ${t.note}` : ''}</p>
                  <span className="text-xs text-muted-foreground">{fmtDate(t.spent_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {e.note && (<><SectionTitle>Ghi chú</SectionTitle><p className="py-1 text-sm text-foreground">{e.note}</p></>)}
      </div>

      <div className="flex gap-3 border-t border-border p-4">
        <Button variant="outline" onClick={() => onDelete(e)} className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Xóa
        </Button>
        <Button className="flex-1" onClick={() => onEdit(e)}>
          <Pencil className="h-4 w-4" /> Chỉnh sửa
        </Button>
      </div>
    </>
  )
}
