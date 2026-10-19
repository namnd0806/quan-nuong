import React, { useRef, useState } from 'react'
import { Calendar, ImageDown, Loader2, X } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export default function FoodCostReportPanel({ open, onClose, data }) {
  const toast = useToast()
  const reportRef = useRef(null)
  const [exporting, setExporting] = useState(false)

  if (!data) return null

  const { kpis = [], topOver = [], foodCostTarget = 30 } = data
  const now = new Date()
  const reportPeriod = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`

  const exportImage = async () => {
    if (!reportRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#071426',
        width: 800,
        height: reportRef.current.scrollHeight,
        style: { width: '800px', maxWidth: 'none' },
      })
      const link = document.createElement('a')
      link.download = `bao-cao-food-cost-${now.toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
      toast.success('Đã tạo ảnh báo cáo. Bạn có thể lưu hoặc gửi ảnh ngay.')
    } catch (error) {
      toast.error(`Không thể xuất ảnh: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        maxWidth="4xl"
        className="flex max-h-[92dvh] flex-col overflow-hidden rounded-3xl border-white/10 p-0"
        style={{ background: 'linear-gradient(145deg, rgba(10,20,35,0.99), rgba(5,15,30,0.99))' }}
      >
        <DialogHeader className="shrink-0 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl sm:text-2xl">Báo cáo Food Cost</DialogTitle>
              <p className="mt-1 text-xs text-gray-400">Tổng hợp giá vốn và các món cần điều chỉnh</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white" aria-label="Đóng báo cáo" title="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
          <div ref={reportRef} className="space-y-4 rounded-2xl bg-[#071426] p-3 sm:space-y-5 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="text-lg font-bold text-white">BÁO CÁO FOOD COST</div>
                <div className="mt-0.5 text-xs text-gray-400">Mộc Nướng · Nướng Chill</div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                <Calendar className="h-4 w-4 text-blue-400" /> {reportPeriod}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {kpis.slice(0, 4).map((kpi, index) => (
                <div key={kpi.label} className={cn('relative min-w-0 overflow-hidden rounded-2xl border p-3 sm:p-4', index === 0 ? 'border-amber-400/25 bg-amber-500/[0.07]' : index === 1 ? 'border-blue-400/25 bg-blue-500/[0.07]' : index === 2 ? 'border-purple-400/25 bg-purple-500/[0.07]' : 'border-emerald-400/25 bg-emerald-500/[0.07]')}>
                  <div className="truncate text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-xs">{kpi.label}</div>
                  <div className={cn('mt-1.5 break-words text-lg font-bold leading-tight sm:text-2xl', kpi.tone || 'text-white')}>{kpi.value}</div>
                  <div className="mt-1 truncate text-[10px] text-gray-500 sm:text-xs">{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-200 sm:text-sm">Món vượt mục tiêu</h3>
                <span className="shrink-0 rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300 sm:text-xs">Mục tiêu ≤ {foodCostTarget}%</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] table-fixed text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.035] text-left text-[10px] uppercase tracking-wider text-gray-400 sm:text-xs">
                      <th className="w-[31%] px-3 py-2.5 font-semibold">Món ăn</th>
                      <th className="w-[23%] px-3 py-2.5 font-semibold">Danh mục</th>
                      <th className="w-[16%] px-2 py-2.5 text-center font-semibold">Food cost</th>
                      <th className="w-[14%] px-2 py-2.5 text-center font-semibold">Mục tiêu</th>
                      <th className="w-[16%] px-2 py-2.5 text-center font-semibold">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topOver.map((item) => (
                      <tr key={`${item.name}-${item.cat}`} className="border-b border-white/[0.07] last:border-0">
                        <td className="px-3 py-3 font-medium text-white">{item.name}</td>
                        <td className="px-3 py-3 text-gray-400">{item.cat || '—'}</td>
                        <td className="px-2 py-3 text-center font-bold text-red-300">{item.fc}</td>
                        <td className="px-2 py-3 text-center text-gray-400">≤ {item.target || 30}%</td>
                        <td className="px-2 py-3 text-center font-bold text-red-400">{item.diff}</td>
                      </tr>
                    ))}
                    {topOver.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không có món nào vượt mục tiêu.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right text-[10px] text-gray-600">Xuất từ hệ thống quản lý Mộc Nướng</div>
          </div>
        </DialogBody>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 bg-[#071426]/95 px-4 py-4 sm:flex sm:justify-end sm:px-6">
          <Button variant="secondary" onClick={onClose} className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"><X className="mr-2 h-4 w-4" /> Thoát</Button>
          <Button onClick={exportImage} disabled={exporting} className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageDown className="mr-2 h-4 w-4" />}
            {exporting ? 'Đang tạo ảnh...' : 'Xuất ảnh'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
