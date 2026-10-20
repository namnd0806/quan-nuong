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

  const sign = amount < 0 ? '-' : ''
  const dong = Math.abs(Math.trunc(amount))
  const millions = Math.floor(dong / 1_000_000)
  const thousands = Math.floor((dong % 1_000_000) / 1_000)
  const remainder = dong % 1_000
  const parts = []

  if (millions) parts.push(`${new Intl.NumberFormat('vi-VN').format(millions)}tr`)
  if (thousands) parts.push(`${thousands}k`)
  if (remainder) parts.push(`${remainder}đ`)

  return parts.length ? `${sign}${parts.join('')}` : '0k'
}
