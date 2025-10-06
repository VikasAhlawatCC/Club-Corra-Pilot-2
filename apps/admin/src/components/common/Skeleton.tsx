import { cn } from '@/lib/utils'
import { Skeleton as ShadCNSkeleton } from '@/components/ui/skeleton'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <ShadCNSkeleton className={className} />
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShadCNSkeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card p-6 rounded-lg border shadow-sm', className)}>
      <div className="flex items-center space-x-4">
        <ShadCNSkeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <ShadCNSkeleton className="h-4 w-3/4" />
          <ShadCNSkeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-card shadow rounded-lg overflow-hidden border">
      <div className="px-6 py-3 border-b">
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <ShadCNSkeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <ShadCNSkeleton
                  key={colIndex}
                  className={cn(
                    'h-4',
                    colIndex === 0 ? 'w-20' : colIndex === columns - 1 ? 'w-24' : 'w-full'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <ShadCNSkeleton className={cn('rounded-full', className)} />
}

export function SkeletonButton({ className }: { className?: string }) {
  return <ShadCNSkeleton className={cn('h-10 w-24 rounded-md', className)} />
}

export function SkeletonInput({ className }: { className?: string }) {
  return <ShadCNSkeleton className={cn('h-10 w-full rounded-md', className)} />
}

export default Skeleton
