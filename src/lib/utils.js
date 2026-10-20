import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatVND(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}

/**
 * Formats an integer VND amount without rounding away any dong.
 * Amounts from one million use "tr"; smaller amounts use "k".
 */
export function formatCompactVND(value) {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount)) return '0k'

  const useMillions = Math.abs(amount) >= 1_000_000
  const divisor = useMillions ? 1_000_000 : 1_000
  const maximumFractionDigits = useMillions ? 6 : 3
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: false,
  }).format(amount / divisor)

  return `${formatted}${useMillions ? 'tr' : 'k'}`
}
