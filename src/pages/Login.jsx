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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-info shadow-lg shadow-primary/30">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-foreground">QUÁN NƯỚNG</h1>
          <p className="text-sm text-muted-foreground">Hệ thống quản lý chuẩn bị mở quán</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl card-glow">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tài khoản</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nam hoặc phuong" autoFocus autoComplete="username" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mật khẩu</label>
            <div className="relative">
              <Input
                type={show ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••" autoComplete="current-password"
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

        <p className="mt-4 text-center text-xs text-muted-foreground">Dùng chung cho 2 chủ quán · Dữ liệu đồng bộ realtime</p>
      </motion.div>
    </div>
  )
}
