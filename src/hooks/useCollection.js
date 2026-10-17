import { useCallback, useEffect, useRef, useState } from 'react'
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
  const requestVersion = useRef(0)

  const fetchAll = useCallback(async () => {
    const version = ++requestVersion.current
    try {
      const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
      if (version !== requestVersion.current) return
      if (error) setError(error)
      else { setRows(data || []); setError(null) }
    } catch (error) {
      if (version === requestVersion.current) setError(error)
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [table, orderBy, ascending])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchAll()
    if (!realtime) return () => { active = false; requestVersion.current++ }
    const channel = supabase
      .channel(`rt-${table}-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => { if (active) fetchAll() })
      .subscribe((status) => { if (active && status === 'SUBSCRIBED') fetchAll() })
    const onFocus = () => { if (active) fetchAll() }
    window.addEventListener('focus', onFocus)
    return () => { active = false; requestVersion.current++; window.removeEventListener('focus', onFocus); supabase.removeChannel(channel) }
  }, [table, realtime, fetchAll])

  const fireNotify = (action, row) => {
    if (!notify) return
    const target = typeof notify.name === 'function' ? notify.name(row) : (row?.name || row?.title || '')
    logNotification({ actor, action: `${action} ${notify.label || ''}`.trim(), target, type: notify.type || 'update' })
  }

  const create = async (values) => {
    const { data, error } = await supabase.from(table).insert(values).select().single()
    if (error) throw error
    requestVersion.current++
    setRows((prev) => [data, ...prev.filter((row) => row.id !== data.id)])
    fireNotify('đã thêm', data)
    await fetchAll()
    return data
  }
  const update = async (id, patch) => {
    const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single()
    if (error) throw error
    requestVersion.current++
    setRows((r) => r.map((x) => (x.id === id ? data : x)))
    fireNotify('đã cập nhật', data)
    await fetchAll()
    return data
  }
  const remove = async (id) => {
    const removed = rows.find((x) => x.id === id)
    const { error } = await supabase.from(table).delete().eq('id', id).select('id').single()
    if (error) throw error
    requestVersion.current++
    setRows((r) => r.filter((x) => x.id !== id))
    fireNotify('đã xóa', removed)
    await fetchAll()
  }

  return { rows, loading, error, refetch: fetchAll, create, update, remove }
}
