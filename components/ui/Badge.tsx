import { cn } from '@/lib/utils'
import { getCategoryLabel } from '@/lib/utils'

interface BadgeProps {
  category: string
  className?: string
}

const CATEGORY_STYLES: Record<string, string> = {
  models:     'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  research:   'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  startups:   'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  products:   'bg-green-500/15 text-green-600 dark:text-green-400',
  regulation: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export default function Badge({ category, className }: BadgeProps) {
  const style = CATEGORY_STYLES[category] ?? 'bg-gray-500/15 text-gray-600'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        style,
        className
      )}
    >
      {getCategoryLabel(category)}
    </span>
  )
}
