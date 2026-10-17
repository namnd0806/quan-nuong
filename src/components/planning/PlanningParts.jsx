import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowLeft, X, Loader2, Paperclip, Trash2, Folder, Wrench, Armchair, Refrigerator, Utensils, FileText, Users, Leaf, Megaphone, Wallet, ClipboardCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { attachmentList } from '@/lib/planning-model'

export const groupIcons = { folder: Folder, tools: Wrench, chair: Armchair, equipment: Refrigerator, food: Utensils, document: FileText, people: Users, leaf: Leaf, marketing: Megaphone, cash: Wallet }
const legacyIcons = { '🏗️': 'tools', '🎨': 'tools', '🪑': 'chair', '🍽️': 'food', '📣': 'marketing', '⚙️': 'tools', '📦': 'folder', Building2: 'tools', PencilRuler: 'tools', Armchair: 'chair', UtensilsCrossed: 'food', Megaphone: 'marketing', Settings2: 'tools' }
export function GroupIcon({ name }) { const Icon = groupIcons[name] || groupIcons[legacyIcons[name]] || Folder; return <Icon size={20} strokeWidth={1.7} /> }
export function Pill({ value, children }) { return <span className={`pw-pill ${['done','paid','low'].includes(value) ? 'green' : ['waiting','partial','high'].includes(value) ? 'amber' : ['overdue','urgent'].includes(value) ? 'red' : value === 'doing' ? 'blue' : ''}`}>{children}</span> }
export function Field({ label, children, full = false }) { return <label className={`pw-field ${full ? 'full' : ''}`}><span>{label}</span>{children}</label> }
export function Stat({ label, value, note, tone = '' }) { return <div className={`pw-stat ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div> }
export function BusyButton({ busy, children, ...props }) { return <button className="pw-primary" {...props} disabled={busy || props.disabled}>{busy ? <Loader2 className="animate-spin" size={17} /> : null}{children}</button> }

export function PlanningPanel({ open, title, onClose, busy = false, children, footer, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
    const previous = document.body.style.overflow
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return <dialog ref={ref} className={`pw-dialog ${wide ? 'wide' : ''}`} onCancel={(e) => { e.preventDefault(); if (!busy) onClose() }} aria-label={title}>
    {open && <><header className="pw-dialog-head"><button type="button" onClick={onClose} disabled={busy} aria-label="Đóng"><ArrowLeft size={20} /></button><h2>{title}</h2><button type="button" onClick={onClose} disabled={busy} aria-label="Đóng cửa sổ"><X size={18} /></button></header><div className="pw-dialog-body">{children}</div>{footer && <footer className="pw-dialog-footer">{footer}</footer>}</>}
  </dialog>
}

function AttachmentLink({ file }) {
  const [url, setUrl] = useState(file.url || '')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    if (file.path) supabase.storage.from('workspace-files').createSignedUrl(file.path, 600).then(({ data, error }) => { if (active) { setUrl(data?.signedUrl || ''); setError(error?.message || '') } })
    return () => { active = false }
  }, [file.path])
  return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="pw-file-link"><Paperclip size={16} /><span>{file.name || 'Tệp đính kèm'}</span></a> : <span className="pw-muted">{error ? 'Không mở được tệp' : 'Đang tải liên kết…'}</span>
}
export function Attachments({ value, onChange, disabled = false, onBusy }) {
  const files = attachmentList(value)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef(null)
  const upload = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setError('')
    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Chọn ảnh JPG/PNG/WebP hoặc PDF, tối đa 8MB.'); return }
    if (files.length >= 10) { setError('Mỗi bản ghi tối đa 10 tệp.'); return }
    setBusy(true)
    onBusy?.(true)
    try {
      const path = `records/${crypto.randomUUID()}.${file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1]}`
      const { error } = await supabase.storage.from('workspace-files').upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      onChange([...files, { path, name: file.name, size: file.size }])
    } catch (e) { setError(e.message) } finally { setBusy(false); onBusy?.(false) }
  }
  return <div className="pw-attachments">{files.map((file, i) => <div className="pw-file" key={file.path || file.url}><AttachmentLink file={file} />{onChange && <button type="button" aria-label={`Bỏ tệp ${file.name}`} disabled={disabled || busy} onClick={() => onChange(files.filter((_, index) => index !== i))}><X size={16} /></button>}</div>)}{onChange && <><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden onChange={upload} disabled={disabled || busy} /><button className="pw-upload" type="button" disabled={disabled || busy} onClick={() => input.current.click()}>{busy ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />} {busy ? 'Đang tải tệp…' : 'Thêm ảnh / tệp đính kèm'}<small>Ảnh hoặc PDF · tối đa 8MB · chỉ người có quyền được xem</small></button></>}{error && <p className="pw-error" role="alert">{error}</p>}</div>
}

export function History({ events }) {
  return <section className="pw-section"><h3>Lịch sử cập nhật</h3>{events.length ? events.slice(0, 12).map((e) => <div className="pw-history" key={e.id}><span className="pw-avatar">{e.actor_name?.slice(0,1).toUpperCase()}</span><div><strong>{e.actor_name}</strong> {e.action}<small>{new Date(e.created_at).toLocaleString('vi-VN')}</small></div></div>) : <p className="pw-muted">Chưa có cập nhật từ phiên bản mới.</p>}</section>
}

export function PlanningNav() { return <nav className="pw-mobile-nav" aria-label="Truy cập nhanh"><NavLink to="/checklist"><ClipboardCheck size={22} />Checklist</NavLink><NavLink to="/budget"><Wallet size={22} />Ngân sách</NavLink></nav> }
