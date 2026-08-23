import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatVND(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}
