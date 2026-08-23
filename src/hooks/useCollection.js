import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { logNotification } from '@/lib/notify'

// Hook CRUD dùng chung + đồng bộ realtime cho mọi bảng.
// notify: { label, type, name(row) } → tự động ghi thông báo khi thêm/sửa/xóa.
export function useCollection(table, { orderBy = 'created_at', ascending = false, realtime = true, notify = null } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { profile, user } = useAuth()
  const actor = profile?.name || user?.email?.split('@')[0] || 'Ai đó'

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
    if (error) setError(error)
    else { setRows(data || []); setError(null) }
    setLoading(false)
  }, [table, orderBy, ascending])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchAll()
    if (!realtime) return () => { active = false }
    const channel = supabase
      .channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => { if (active) fetchAll() })
      .subscribe()
    return () => { active = false; supabase.removeChannel(channel) }
  }, [table, realtime, fetchAll])

  const fireNotify = (action, row) => {
    if (!notify) return
    const target = typeof notify.name === 'function' ? notify.name(row) : (row?.name || '')
    logNotification({ actor, action: `${action} ${notify.label || ''}`.trim(), target, type: notify.type || 'update' })
  }

  const create = async (values) => {
    const { data, error } = await supabase.from(table).insert(values).select().single()
    if (error) throw error
    setRows((prev) => [data, ...prev])
    fireNotify('đã thêm', data)
    return data
  }
  const update = async (id, patch) => {
    const prev = rows
    const merged = prev.find((x) => x.id === id)
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x))) // optimistic
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) { setRows(prev); throw error }
    fireNotify('đã cập nhật', { ...merged, ...patch })
  }
  const remove = async (id) => {
    const prev = rows
    const removed = prev.find((x) => x.id === id)
    setRows((r) => r.filter((x) => x.id !== id)) // optimistic
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) { setRows(prev); throw error }
    fireNotify('đã xóa', removed)
  }

  return { rows, loading, error, refetch: fetchAll, create, update, remove }
}
