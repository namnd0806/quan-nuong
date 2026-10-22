import { createClient } from 'npm:@supabase/supabase-js@2.112.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
})

const normalize = (value: string | null | undefined) => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

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
    const token = authHeader.slice(7)
    const { data: authData, error: authError } = await admin.auth.getUser(token)
    if (authError || !authData.user) return json({ ok: false, error: 'Phiên đăng nhập không hợp lệ.' }, 401)

    const [configResult, categoryResult, memberResult, itemResult, paymentResult] = await Promise.all([
      admin.from('sheet_sync_config').select('webhook_url,sheet_name').eq('id', true).maybeSingle(),
      admin.from('main_categories').select('id,name,sort').order('sort'),
      admin.from('members').select('id,name,sort').order('sort'),
      admin.from('budget_items').select('id,name,category,category_id,planned,note,created_at'),
      admin.from('budget_transactions').select('item_id,payer_id,amount,voided_at').is('voided_at', null),
    ])

    for (const result of [configResult, categoryResult, memberResult, itemResult, paymentResult]) {
      if (result.error) throw result.error
    }
    if (!configResult.data?.webhook_url) throw new Error('Chưa cấu hình Google Sheet nhận dữ liệu.')

    const categories = categoryResult.data || []
    const members = memberResult.data || []
    const items = itemResult.data || []
    const payments = paymentResult.data || []
    const nam = members.find((member) => normalize(member.name).startsWith('nam'))
    const phuong = members.find((member) => normalize(member.name).startsWith('phuong'))
    if (!nam || !phuong) throw new Error('Không tìm thấy đủ hai thành viên Nam và Phương.')

    const categoryIndex = new Map(categories.map((category, index) => [category.id, { ...category, index }]))
    const paymentsByItem = new Map<string, typeof payments>()
    for (const payment of payments) {
      const current = paymentsByItem.get(payment.item_id) || []
      current.push(payment)
      paymentsByItem.set(payment.item_id, current)
    }

    const rows = items.map((item) => {
      const itemPayments = paymentsByItem.get(item.id) || []
      const namSpent = itemPayments.filter((payment) => payment.payer_id === nam.id).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      const phuongSpent = itemPayments.filter((payment) => payment.payer_id === phuong.id).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      const totalSpent = itemPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
      const planned = Number(item.planned || 0)
      const status = totalSpent <= 0 ? 'Chưa chi' : planned > 0 && totalSpent < planned ? 'Một phần' : 'Đã thanh toán'
      const category = categoryIndex.get(item.category_id)
      return {
        category: category?.name || item.category || 'Chưa phân nhóm',
        categoryOrder: category?.index ?? 999,
        name: item.name,
        planned,
        totalSpent,
        namSpent,
        phuongSpent,
        status,
        note: item.note || '',
        createdAt: item.created_at,
      }
    }).sort((a, b) => a.categoryOrder - b.categoryOrder || a.category.localeCompare(b.category, 'vi') || a.createdAt.localeCompare(b.createdAt))

    const response = await fetch(configResult.data.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ source: 'quan-nuong-budget-v1', sheetName: configResult.data.sheet_name, rows }),
      // Apps Script ContentService answers with a one-time redirect to
      // script.googleusercontent.com. Following that redirect is unreliable
      // from the Edge runtime even though doPost has already completed.
      redirect: 'manual',
    })
    const appsScriptRedirect = response.status >= 300 && response.status < 400
    if (!appsScriptRedirect) {
      const text = await response.text()
      let result: { ok?: boolean; error?: string } = {}
      try { result = JSON.parse(text) } catch { throw new Error('Google Sheet trả về dữ liệu không hợp lệ.') }
      if (!response.ok || !result.ok) throw new Error(result.error || 'Google Sheet từ chối cập nhật.')
    }

    return json({ ok: true, rows: rows.length, syncedAt: new Date().toISOString() })
  } catch (error) {
    console.error('sync-budget-sheet', error)
    return json({ ok: false, error: error instanceof Error ? error.message : 'Không đồng bộ được Google Sheet.' }, 500)
  }
})
