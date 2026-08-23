import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ClipboardCheck, Wallet, UtensilsCrossed,
  Store, Bell, Menu, X, Flame, Search, Settings, Sun, Moon,
  CheckCircle2, PencilLine, Wallet as WalletIcon, Store as StoreIcon,
  StickyNote, LogOut, Calendar,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/context/AuthContext'
import { useCollection } from '@/hooks/useCollection'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/checklist', icon: ClipboardCheck, label: 'Checklist' },
  { path: '/budget', icon: Wallet, label: 'Ngân sách' },
  { path: '/menu-cost', icon: UtensilsCrossed, label: 'Menu & Cost' },
  { path: '/suppliers', icon: Store, label: 'Nhà cung cấp' },
  { path: '/notes', icon: StickyNote, label: 'Ghi chú' },
]

const pageTitles = {
  '/': 'Dashboard',
  '/checklist': 'Checklist',
  '/budget': 'Ngân sách',
  '/menu-cost': 'Menu & Cost',
  '/suppliers': 'Nhà cung cấp',
  '/notes': 'Ghi chú',
  '/settings': 'Cài đặt',
}

const notifIcon = {
  done: { icon: CheckCircle2, tone: 'text-success bg-success/15' },
  update: { icon: PencilLine, tone: 'text-info bg-info/15' },
  budget: { icon: WalletIcon, tone: 'text-warning bg-warning/15' },
  supplier: { icon: StoreIcon, tone: 'text-primary bg-primary/15' },
}

function SidebarContent({ onNavigate }) {
  const { profile, user, signOut } = useAuth()
  const name = profile?.name || user?.email?.split('@')[0] || 'Người dùng'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="flex h-full flex-col">
      {/* Logo header */}
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-base font-bold leading-tight text-foreground">QUÁN NƯỚNG</div>
          <div className="text-xs font-medium text-orange-400">Pre-opening</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(99,102,241,0.2))',
                        boxShadow: '0 0 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                        border: '1px solid rgba(59,130,246,0.4)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Settings & User */}
      <div className="border-t border-border/40 p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all mb-3',
              isActive
                ? 'bg-white/5 text-gray-200 border border-border/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            )
          }
        >
          <Settings className="h-5 w-5" />
          <span>Cài đặt</span>
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-semibold text-foreground">{name}</div>
                <div className="truncate text-xs text-gray-400">Chủ quán</div>
              </div>
              <LogOut className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Đổi giao diện" className="rounded-xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -8, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { rows: notifications } = useCollection('notifications', { orderBy: 'created_at', ascending: false })
  const unread = notifications.filter((n) => !n.is_read).length

  const markAllRead = async () => {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
  }

  const markOneRead = async (n) => {
    if (n.is_read) return
    await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={() => setOpen((o) => !o)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-background"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <span className="text-sm font-semibold text-foreground">Thông báo</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
                ) : notifications.map((n) => {
                  const meta = notifIcon[n.type] || notifIcon.update
                  const Icon = meta.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n)}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-border/30 px-5 py-4 text-left transition-all last:border-0 hover:bg-white/5',
                        !n.is_read && 'bg-blue-500/5'
                      )}
                    >
                      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground">
                          {n.actor && <span className="font-semibold">{n.actor} </span>}
                          <span className="text-muted-foreground">{n.action}</span>{' '}
                          {n.target && <span className="font-medium">{n.target}</span>}
                        </p>
                        <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </div>
                      {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] border-r border-border/40 lg:block" style={{ background: 'linear-gradient(180deg, rgba(10,22,40,0.98), rgba(10,22,40,0.95))' }}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 w-[250px] border-r border-border/40 bg-card lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[250px]">
        {/* Header */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/40 px-4 backdrop-blur-xl md:px-6"
          style={{ background: 'linear-gradient(90deg, rgba(10,22,40,0.95), rgba(15,30,50,0.90))' }}
        >
          <Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="ml-auto flex items-center gap-2">
            {/* Search bar */}
            <div className="hidden items-center gap-2 rounded-xl border border-border/50 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all focus-within:border-blue-500/50 focus-within:bg-white/10 sm:flex">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                placeholder="Tìm kiếm..."
                className="w-32 bg-transparent text-sm text-foreground outline-none placeholder:text-gray-500 md:w-48"
              />
            </div>

            {/* Date display */}
            <Button variant="ghost" size="sm" className="hidden gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground md:inline-flex">
              <Calendar className="h-4 w-4" />
              {today}
            </Button>

            <ThemeToggle />
            <NotificationBell />

            <div className="h-6 w-px bg-border/50" />

            <HeaderUserAvatar />
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function HeaderUserAvatar() {
  const { profile, user } = useAuth()
  const name = profile?.name || user?.email?.split('@')[0] || 'N'
  const initial = name.charAt(0).toUpperCase()
  return (
    <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent transition-all hover:ring-blue-500/50">
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}
