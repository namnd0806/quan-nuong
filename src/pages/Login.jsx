import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4" style={{ background: 'linear-gradient(180deg, #050B1F 0%, #0A1628 50%, #0F1E32 100%)' }}>
      {/* Animated glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-1/4 h-96 w-96 rounded-full opacity-30 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Diagonal stripe glow */}
        <motion.div
          className="absolute right-0 top-0 h-full w-2 opacity-40"
          style={{
            background: 'linear-gradient(180deg, transparent, #3B82F6, transparent)',
            boxShadow: '0 0 40px 10px #3B82F6',
            transform: 'rotate(25deg) translateX(200px)',
          }}
          animate={{
            y: ['-100%', '100%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <form onSubmit={submit} className="relative overflow-hidden rounded-3xl p-[1px]">
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/50 via-purple-500/30 to-blue-500/50 opacity-60" />
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-40"
            style={{ background: 'conic-gradient(from 0deg, transparent, #3B82F6, transparent, #8B5CF6, transparent)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          {/* Card content */}
          <div className="relative rounded-3xl bg-[#0A1628]/95 px-8 py-10 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold text-white"
              >
                Login
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mx-auto mt-3 h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
            </div>

            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-medium text-blue-300">Username</label>
                <div className="relative">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder=""
                    autoFocus
                    autoComplete="username"
                    className="h-12 rounded-2xl border-blue-500/30 bg-[#0F1E32]/60 px-4 text-white placeholder:text-gray-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-medium text-blue-300">Password</label>
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    autoComplete="current-password"
                    className="h-12 rounded-2xl border-blue-500/30 bg-[#0F1E32]/60 px-4 pr-12 text-white placeholder:text-gray-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-blue-400"
                  >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={busy}
                  className="relative h-12 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
