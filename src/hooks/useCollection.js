import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Hook CRUD dùng chung + đồng bộ realtime cho mọi bảng.
export function useCollection(table, { orderBy = 'created_at', ascending = false, realtime = true } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const create = async (values) => {
    const { data, error } = await supabase.from(table).insert(values).select().single()
    if (error) throw error
    setRows((prev) => [data, ...prev])
    return data
  }
  const update = async (id, patch) => {
    const prev = rows
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x))) // optimistic
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) { setRows(prev); throw error }
  }
  const remove = async (id) => {
    const prev = rows
    setRows((r) => r.filter((x) => x.id !== id)) // optimistic
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) { setRows(prev); throw error }
  }

  return { rows, loading, error, refetch: fetchAll, create, update, remove }
}
