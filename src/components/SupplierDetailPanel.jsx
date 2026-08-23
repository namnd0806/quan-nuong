import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, Mail, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS = {
  active: { label: 'Đang hợp tác', variant: 'success' },
  considering: { label: 'Đang xem xét', variant: 'warning' },
  inactive: { label: 'Ngừng hợp tác', variant: 'muted' },
}

function fmtDate(iso) {
  if (!iso) return 'Chưa cập nhật'
  try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) } catch { return 'Chưa cập nhật' }
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-sm text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export default function SupplierDetailPanel({ supplier, onClose }) {
  return (
    <AnimatePresence>
      {supplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-display text-2xl text-foreground">Chi tiết nhà cung cấp</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="h-5 w-5" /></Button>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
              {/* Left: identity + contact */}
              <div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 rounded-xl"><AvatarFallback className="rounded-xl text-lg">{supplier.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{supplier.name}</div>
                    <Badge variant={(STATUS[supplier.status] || STATUS.active).variant} className="mt-1">{(STATUS[supplier.status] || STATUS.active).label}</Badge>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-2">
                  <Row icon={Phone} label="Số điện thoại" value={supplier.code} />
                  <Row icon={Mail} label="Email" value={supplier.email || 'Chưa cập nhật'} />
                  <Row icon={MapPin} label="Địa chỉ" value={supplier.address || 'Chưa cập nhật'} />
                </div>

                <div className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Danh mục</span>
                    <div className="mt-1">
                      {supplier.tag && (
                        <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: `${(supplier.tagColor || 'hsl(215 20% 45%)').replace(')', ' / 0.15)')}`, color: supplier.tagColor || 'hsl(215 20% 45%)' }}>{supplier.tag}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày tạo</span>
                    <div className="mt-0.5 text-foreground">{fmtDate(supplier.created_at)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Đặt hàng gần nhất</span>
                    <div className="mt-0.5 text-foreground">{fmtDate(supplier.last_order)}</div>
                  </div>
                </div>
              </div>

              {/* Right: products + note */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Sản phẩm cung cấp ({supplier.products})</h3>
                </div>
                <ul className="space-y-1.5">
                  {(supplier.productList || []).length === 0 && <li className="text-sm text-muted-foreground">Chưa có sản phẩm. Bấm “Chỉnh sửa” để thêm.</li>}
                  {(supplier.productList || []).slice(0, 8).map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {p}
                    </li>
                  ))}
                </ul>
                {supplier.products > 8 && (
                  <div className="mt-2 text-sm text-muted-foreground">+ {supplier.products - 8} sản phẩm khác</div>
                )}

                <div className="mt-5">
                  <h3 className="mb-1.5 text-sm font-semibold text-foreground">Ghi chú</h3>
                  <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                    {supplier.note || 'Chưa có ghi chú'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border px-6 py-4">
              <Button variant="secondary" onClick={onClose}>Đóng</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
