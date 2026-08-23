import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'

/**
 * BadgeSelect — trạng thái/ưu tiên chỉnh sửa trực tiếp trong bảng.
 * options: [{ value, label, variant }]
 */
export function BadgeSelect({ value, options, onChange, className }) {
  const current = options.find((o) => o.value === value) || options[0]

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger
        className={cn(
          badgeVariants({ variant: current.variant }),
          'cursor-pointer gap-1 outline-none transition-all hover:ring-2 hover:ring-ring/40 focus:ring-2 focus:ring-ring data-[state=open]:ring-2 data-[state=open]:ring-ring',
          className
        )}
      >
        <SelectPrimitive.Value>{current.label}</SelectPrimitive.Value>
        <SelectPrimitive.Icon>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="opacity-70">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <SelectPrimitive.Viewport className="min-w-[9rem]">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <span className={cn('h-2 w-2 rounded-full', {
                  'bg-primary': o.variant === 'default',
                  'bg-success': o.variant === 'success',
                  'bg-warning': o.variant === 'warning',
                  'bg-destructive': o.variant === 'destructive',
                  'bg-info': o.variant === 'info',
                  'bg-muted-foreground': o.variant === 'muted',
                })} />
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
