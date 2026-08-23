import React from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

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
  const st = STATUS[supplier?.status] || STATUS.active

  return (
    <Dialog open={!!supplier} onOpenChange={(open) => !open && onClose()}>
      <DialogContent maxWidth="3xl" onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 rounded-xl">
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                {supplier?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{supplier?.name}</DialogTitle>
              <Badge variant={st.variant} className="mt-1">{st.label}</Badge>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column: Contact info */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Thông tin liên hệ</h3>
                <div className="space-y-3 rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <Row icon={Phone} label="Số điện thoại" value={supplier?.code} />
                  <Row icon={Mail} label="Email" value={supplier?.email || 'Chưa cập nhật'} />
                  <Row icon={MapPin} label="Địa chỉ" value={supplier?.address || 'Chưa cập nhật'} />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Thông tin khác</h3>
                <div className="space-y-3 rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <span className="text-sm text-gray-400">Danh mục</span>
                    <div className="mt-1">
                      {supplier?.tag ? (
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium" style={{
                          background: `${(supplier.tagColor || 'hsl(215 20% 45%)').replace(')', ' / 0.15)')}`,
                          color: supplier.tagColor || 'hsl(215 20% 45%)'
                        }}>
                          {supplier.tag}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa phân loại</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Ngày tạo</span>
                    <div className="mt-1 text-sm text-foreground">{fmtDate(supplier?.created_at)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Đặt hàng gần nhất</span>
                    <div className="mt-1 text-sm text-foreground">{fmtDate(supplier?.last_order)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Products & Notes */}
            <div className="space-y-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    Sản phẩm cung cấp ({supplier?.products || 0})
                  </h3>
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-xl border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {(!supplier?.productList || supplier.productList.length === 0) ? (
                    <p className="text-sm text-gray-400">Chưa có sản phẩm. Bấm "Chỉnh sửa" để thêm.</p>
                  ) : (
                    <ul className="space-y-2">
                      {supplier.productList.slice(0, 12).map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {supplier?.products > 12 && (
                    <div className="mt-3 border-t border-white/10 pt-3 text-sm text-gray-400">
                      + {supplier.products - 12} sản phẩm khác
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Ghi chú</h3>
                <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-300" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {supplier?.note || 'Chưa có ghi chú'}
                </div>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
