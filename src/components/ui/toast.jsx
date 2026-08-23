import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CheckCircle2, ring: 'border-success/30', bar: 'bg-success', tint: 'text-success bg-success/15' },
  error: { icon: AlertTriangle, ring: 'border-destructive/30', bar: 'bg-destructive', tint: 'text-destructive bg-destructive/15' },
  info: { icon: Info, ring: 'border-info/30', bar: 'bg-info', tint: 'text-info bg-info/15' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback((type, message, opts = {}) => {
    const id = ++idRef.current
    const duration = opts.duration ?? (type === 'error' ? 5000 : 3200)
    setToasts((t) => [...t, { id, type, message, title: opts.title }])
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const toast = {
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
    info: (m, o) => push('info', m, o),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
          <AnimatePresence>
            {toasts.map((t) => {
              const tone = TONES[t.type] || TONES.info
              const Icon = tone.icon
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={cn(
                    'pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border bg-popover/95 px-4 py-3 shadow-2xl backdrop-blur',
                    tone.ring
                  )}
                >
                  <span className={cn('absolute inset-y-0 left-0 w-1', tone.bar)} />
                  <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone.tint)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    {t.title && <p className="text-sm font-semibold text-foreground">{t.title}</p>}
                    <p className="text-sm leading-snug text-muted-foreground">{t.message}</p>
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
