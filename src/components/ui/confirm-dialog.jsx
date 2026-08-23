import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Hộp thoại xác nhận dùng chung (xóa / hành động nguy hiểm).
export default function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xóa',
  variant = 'destructive',
  loading = false,
  onClose,
  onConfirm,
}) {
  const Icon = variant === 'destructive' ? Trash2 : AlertTriangle
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className={variant === 'destructive'
              ? 'flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive'
              : 'flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning'}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-lg text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} disabled={loading}>Hủy</Button>
              <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={onConfirm} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
