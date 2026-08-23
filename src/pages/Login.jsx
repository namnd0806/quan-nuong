import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { toEmail } from '@/lib/supabase'

export default function Login() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = location.state?.from?.pathname || '/'
  if (session) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) { setError('Vui lòng nhập tài khoản và mật khẩu.'); return }
    setBusy(true)
    const { error } = await signIn(toEmail(username), password)
    setBusy(false)
    if (error) {
      setError(
        error.message?.toLowerCase().includes('invalid')
          ? 'Sai tài khoản hoặc mật khẩu.'
          : `Đăng nhập thất bại: ${error.message}`
      )
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Nền trang trí */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-info/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-warning/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info shadow-xl shadow-primary/40"
          >
            <Flame className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="mt-5 font-display text-3xl tracking-tight text-foreground">QUÁN NƯỚNG</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hệ thống quản lý chuẩn bị mở quán</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur card-glow">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tài khoản</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" autoFocus autoComplete="username" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mật khẩu</label>
            <div className="relative">
              <Input
                type={show ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" autoComplete="current-password"
                className="pr-10"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
