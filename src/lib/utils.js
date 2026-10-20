import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function roundVNDToThousand(value) {
  const amount = Number(value || 0)
  if (!Number.isFinite(amount) || amount === 0) return 0
  const rounded = Math.round(Math.abs(amount) / 1_000) * 1_000
  return Math.sign(amount) * Math.max(1_000, rounded)
}

export function formatVND(value) {
  return new Intl.NumberFormat('vi-VN').format(roundVNDToThousand(value)) + 'đ'
}

/**
 * Formats an integer VND amount without rounding away any dong.
 * Amounts from one million use "tr"; smaller amounts use "k".
 */
export function formatCompactVND(value) {
  const amount = roundVNDToThousand(value)
  if (!Number.isFinite(amount)) return '0k'

  const sign = amount < 0 ? '-' : ''
  const dong = Math.abs(amount)
  const millions = Math.floor(dong / 1_000_000)
  const thousands = Math.floor((dong % 1_000_000) / 1_000)
  const parts = []

  if (millions) parts.push(`${new Intl.NumberFormat('vi-VN').format(millions)}tr`)
  if (thousands) parts.push(`${thousands}k`)

  return parts.length ? `${sign}${parts.join('')}` : '0k'
}
