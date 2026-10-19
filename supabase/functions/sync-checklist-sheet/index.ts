import { createClient } from 'npm:@supabase/supabase-js@2.112.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
})

const statusLabels: Record<string, string> = {
  todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ xử lý', paused: 'Tạm dừng', done: 'Hoàn thành', overdue: 'Quá hạn',
}
const priorityLabels: Record<string, string> = { low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' }

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) throw new Error('Thiếu cấu hình Supabase của Edge Function.')

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ ok: false, error: 'Bạn cần đăng nhập.' }, 401)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: authData, error: authError } = await admin.auth.getUser(authHeader.slice(7))
    if (authError || !authData.user) return json({ ok: false, error: 'Phiên đăng nhập không hợp lệ.' }, 401)

    const [configResult, categoryResult, taskResult] = await Promise.all([
      admin.from('sheet_sync_config').select('webhook_url').eq('id', true).maybeSingle(),
      admin.from('main_categories').select('id,name,sort').order('sort'),
      admin.from('checklist_tasks').select('id,title,description,dept,category_id,assignee,deadline,priority,status,created_at'),
    ])
    for (const result of [configResult, categoryResult, taskResult]) if (result.error) throw result.error
    if (!configResult.data?.webhook_url) throw new Error('Chưa cấu hình Google Sheet nhận dữ liệu.')

    const categories = categoryResult.data || []
    const categoryIndex = new Map(categories.map((category, index) => [category.id, { ...category, index }]))
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    const rows = (taskResult.data || []).map((task) => {
      const category = categoryIndex.get(task.category_id)
      const overdue = task.status !== 'done' && (task.status === 'overdue' || Boolean(task.deadline && task.deadline < today))
      return {
        category: category?.name || task.dept || 'Chưa phân nhóm',
        categoryOrder: category?.index ?? 999,
        title: task.title,
        assignee: task.assignee || '',
        status: overdue ? 'Quá hạn' : (statusLabels[task.status] || task.status),
        priority: priorityLabels[task.priority] || task.priority,
        deadline: task.deadline ? task.deadline.split('-').reverse().join('/') : '',
        note: task.description || '',
        createdAt: task.created_at,
      }
    }).sort((a, b) => a.categoryOrder - b.categoryOrder || a.category.localeCompare(b.category, 'vi') || a.createdAt.localeCompare(b.createdAt))

    const response = await fetch(configResult.data.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ source: 'quan-nuong-checklist-v1', sheetName: 'CHECKLIST', rows }),
      redirect: 'follow',
    })
    const text = await response.text()
    let result: { ok?: boolean; error?: string } = {}
    try { result = JSON.parse(text) } catch { throw new Error('Google Sheet trả về dữ liệu không hợp lệ.') }
    if (!response.ok || !result.ok) throw new Error(result.error || 'Google Sheet từ chối cập nhật.')

    return json({ ok: true, rows: rows.length, syncedAt: new Date().toISOString() })
  } catch (error) {
    console.error('sync-checklist-sheet', error)
    return json({ ok: false, error: error instanceof Error ? error.message : 'Không đồng bộ được Google Sheet.' }, 500)
  }
})
