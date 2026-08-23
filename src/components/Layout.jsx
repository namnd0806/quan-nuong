import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ClipboardCheck, Wallet, UtensilsCrossed,
  Store, Bell, Menu, X, Flame, Search, Settings, Sun, Moon,
  CheckCircle2, PencilLine, Wallet as WalletIcon, Store as StoreIcon,
  StickyNote, LogOut,
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
  '/checklist': 'Checklist Setup',
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
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-5">
        {/* Logo Nướng chill */}
        <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0" fill="none">
          {/* Bếp than hoa tối giản */}
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(38 92% 50%)" />
              <stop offset="100%" stopColor="hsl(258 90% 66%)" />
            </linearGradient>
          </defs>
          {/* Bowl grill */}
          <path d="M8 18c0-5 6-8 12-8s12 3 12 8v6c0 2-2 3-4 3H12c-2 0-4-1-4-3v-6z" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Viên than đỏ bên trong */}
          <circle cx="20" cy="22" r="1.5" fill="hsl(350 89% 60%)" opacity="0.8" />
          <circle cx="16" cy="20" r="1.2" fill="hsl(350 89% 60%)" opacity="0.6" />
          <circle cx="24" cy="20" r="1.2" fill="hsl(350 89% 60%)" opacity="0.6" />
          {/* Flame nhỏ phía trên */}
          <path d="M20 12c0.5-1.5 2-2 2-3 0-1-0.5-1.5-1.5-1.5-1 0-1.5 0.5-1.5 1.5 0 1 1.5 1.5 1 3z" fill="url(#logoGrad)" />
        </svg>
        <div>
          <div className="font-sans text-sm font-bold leading-tight text-foreground">Nướng chill</div>
          <div className="text-xs text-muted-foreground">Pre-opening</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                  'group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-lg border border-primary/30"
                      style={{ background: 'linear-gradient(90deg, rgba(37,99,235,.15), rgba(99,102,241,.08))' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
              isActive
                ? 'border border-primary/30 text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )
          }
          style={({ isActive }) => isActive ? { background: 'linear-gradient(90deg, rgba(37,99,235,.15), rgba(99,102,241,.08))' } : {}}
        >
          <Settings className="h-5 w-5" />
          <span>Cài đặt</span>
        </NavLink>
        <div className="mt-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
          <Avatar>
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-foreground">{name}</div>
            <div className="truncate text-xs text-muted-foreground">Chủ quán</div>
          </div>
          <button onClick={signOut} title="Đăng xuất" className="text-muted-foreground transition-colors hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Đổi giao diện">
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
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen((o) => !o)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
            {unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Thông báo</span>
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">Đánh dấu đã đọc</button>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
                ) : notifications.map((n) => {
                  const meta = notifIcon[n.type] || notifIcon.update
                  const Icon = meta.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n)}
                      className={cn('flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-accent', !n.is_read && 'bg-primary/5')}
                    >
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground">
                          {n.actor && <span className="font-semibold">{n.actor} </span>}
                          <span className="text-muted-foreground">{n.action}</span>{' '}
                          {n.target && <span className="font-medium">{n.target}</span>}
                        </p>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                      </div>
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

function HeaderUserMenu() {
  const { profile, user, signOut } = useAuth()
  const name = profile?.name || user?.email?.split('@')[0] || 'Người dùng'
  const initial = name.charAt(0).toUpperCase()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none ring-ring focus-visible:ring-2">
          <Avatar className="h-9 w-9"><AvatarFallback>{initial}</AvatarFallback></Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="px-2 py-1.5">
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-border glass lg:block">
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-border bg-card lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 z-10 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 backdrop-blur-sm px-4 md:px-6" style={{ background: 'linear-gradient(180deg, hsl(218 44% 7% / 0.98), hsl(218 42% 9% / 0.95))' }}>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="font-sans text-base font-bold text-foreground">{pageTitles[location.pathname] || 'Quán Nướng'}</div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border/70 bg-secondary/40 px-3 py-2 text-sm text-muted-foreground sm:flex" style={{ background: 'rgba(218 41% 12% / 0.6)' }}>
              <Search className="h-4 w-4" />
              <input
                placeholder="Tìm kiếm..."
                className="w-32 bg-transparent text-foreground outline-none placeholder:text-muted-foreground md:w-48"
              />
            </div>
            <Button variant="ghost" size="sm" className="hidden text-xs text-muted-foreground md:inline-flex hover:text-foreground">
              {today}
            </Button>
            <ThemeToggle />
            <NotificationBell />
            <HeaderUserMenu />
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
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
